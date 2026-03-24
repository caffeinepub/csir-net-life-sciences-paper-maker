import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import VarArray "mo:core/VarArray";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type SyllabusUnit = {
    id : Text;
    name : Text;
    topics : [Topic];
  };

  type Topic = {
    id : Text;
    name : Text;
    subtopics : [Subtopic];
  };

  type Subtopic = {
    id : Text;
    name : Text;
  };

  public type Question = {
    id : Text;
    text : Text;
    optionA : Text;
    optionB : Text;
    optionC : Text;
    optionD : Text;
    correctAnswer : Text;
    explanation : ?Text;
    unitId : Text;
    topicId : Text;
    subtopicId : Text;
    part : Text;
    difficulty : Text;
    createdAt : Int;
  };

  type QuestionCountStats = {
    unitId : Text;
    part : Text;
    difficulty : Text;
    count : Nat;
  };

  public type Settings = {
    instituteName : Text;
    footerText : Text;
    watermarkText : Text;
    negativeMarkingEnabled : Bool;
    negativeMarkingValue : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  module Question {
    public func compare(q1 : Question, q2 : Question) : Order.Order {
      Text.compare(q1.id, q2.id);
    };
  };

  module QuestionCountStats {
    public func compareByUnitCountPart(u1 : QuestionCountStats, u2 : QuestionCountStats) : Order.Order {
      switch (Text.compare(u1.unitId, u2.unitId)) {
        case (#equal) {
          switch (Nat.compare(u1.count, u2.count)) {
            case (#equal) {
              Text.compare(u1.part, u2.part);
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type PaperFilter = {
    unitId : ?Text;
    topicId : ?Text;
    subtopicId : ?Text;
    part : ?Text;
    difficulty : ?Text;
    questionCount : Nat;
  };

  public type PaperGenerationRequest = {
    questions : [Question];
    totalQuestions : Nat;
    selectedUnit : ?Text;
    selectedTopic : ?Text;
    selectedSubtopic : ?Text;
    selectedPart : ?Text;
    selectedDifficulty : ?Text;
  };

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Persistent state
  let questions = Map.empty<Text, Question>();
  let syllabus = Map.empty<Text, SyllabusUnit>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextQuestionId = 1;
  var settings : Settings = {
    instituteName = "Default Institute";
    footerText = "Good luck!";
    watermarkText = "CSIR NET Paper";
    negativeMarkingEnabled = false;
    negativeMarkingValue = 0.0;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Syllabus Functions
  public shared ({ caller }) func addSyllabusUnit(unit : SyllabusUnit) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add syllabus units");
    };
    syllabus.add(unit.id, unit);
  };

  // Question Management
  public shared ({ caller }) func createQuestion(question : Question) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create questions");
    };
    let id = "q" # nextQuestionId.toText();
    nextQuestionId += 1;

    let newQuestion : Question = {
      question with
      id;
      createdAt = Time.now();
    };

    questions.add(id, newQuestion);
    id;
  };

  public query ({ caller }) func getQuestion(id : Text) : async Question {
    switch (questions.get(id)) {
      case (null) { Runtime.trap("Question not found") };
      case (?question) { question };
    };
  };

  public shared ({ caller }) func updateQuestion(question : Question) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update questions");
    };
    if (not questions.containsKey(question.id)) {
      Runtime.trap("Question not found");
    };
    questions.add(question.id, question);
  };

  public shared ({ caller }) func deleteQuestion(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };
    if (not questions.containsKey(id)) {
      Runtime.trap("Question not found");
    };
    questions.remove(id);
  };

  func filterQuestionsArray(filter : PaperFilter) : [Question] {
    questions.values().toArray().filter(
      func(q) {
        switch (filter.unitId) {
          case (null) {};
          case (?id) { if (q.unitId != id) { return false } };
        };
        switch (filter.topicId) {
          case (null) {};
          case (?id) { if (q.topicId != id) { return false } };
        };
        switch (filter.subtopicId) {
          case (null) {};
          case (?id) { if (q.subtopicId != id) { return false } };
        };
        switch (filter.part) {
          case (null) {};
          case (?p) { if (q.part != p) { return false } };
        };
        switch (filter.difficulty) {
          case (null) {};
          case (?d) { if (q.difficulty != d) { return false } };
        };
        true;
      }
    );
  };

  // Paper Generation
  public query ({ caller }) func generatePaper(filter : PaperFilter) : async PaperGenerationRequest {
    let filteredQuestions = filterQuestionsArray(filter);

    let selectedQuestions = filteredQuestions.sliceToArray(
      0,
      Nat.min(filteredQuestions.size(), filter.questionCount),
    );

    {
      questions = selectedQuestions;
      totalQuestions = filter.questionCount;
      selectedUnit = filter.unitId;
      selectedTopic = filter.topicId;
      selectedSubtopic = filter.subtopicId;
      selectedPart = filter.part;
      selectedDifficulty = filter.difficulty;
    };
  };

  // Stats
  public query ({ caller }) func getQuestionStats() : async [QuestionCountStats] {
    questions.values().toArray().map(
      func(q) {
        {
          unitId = q.unitId;
          part = q.part;
          difficulty = q.difficulty;
          count = 1;
        };
      }
    ).sort(QuestionCountStats.compareByUnitCountPart);
  };

  // Settings Management
  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
  };

  public query ({ caller }) func getSettings() : async Settings {
    settings;
  };

  // Search
  public query ({ caller }) func searchQuestions(searchText : Text) : async [Question] {
    questions.values().toArray().filter(
      func(q) {
        q.text.contains(#text searchText);
      }
    );
  };

  // Get Syllabus
  public query ({ caller }) func getSyllabus() : async [SyllabusUnit] {
    syllabus.values().toArray();
  };
};
