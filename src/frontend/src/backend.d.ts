import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface QuestionCountStats {
    difficulty: string;
    part: string;
    count: bigint;
    unitId: string;
}
export interface Settings {
    watermarkText: string;
    instituteName: string;
    negativeMarkingValue: number;
    negativeMarkingEnabled: boolean;
    footerText: string;
}
export interface PaperFilter {
    difficulty?: string;
    part?: string;
    unitId?: string;
    subtopicId?: string;
    questionCount: bigint;
    topicId?: string;
}
export interface SyllabusUnit {
    id: string;
    name: string;
    topics: Array<Topic>;
}
export interface Topic {
    id: string;
    name: string;
    subtopics: Array<Subtopic>;
}
export interface Subtopic {
    id: string;
    name: string;
}
export interface Question {
    id: string;
    difficulty: string;
    explanation?: string;
    createdAt: bigint;
    part: string;
    text: string;
    correctAnswer: string;
    unitId: string;
    subtopicId: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    topicId: string;
}
export interface PaperGenerationRequest {
    selectedTopic?: string;
    selectedDifficulty?: string;
    totalQuestions: bigint;
    questions: Array<Question>;
    selectedSubtopic?: string;
    selectedPart?: string;
    selectedUnit?: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSyllabusUnit(unit: SyllabusUnit): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createQuestion(question: Question): Promise<string>;
    deleteQuestion(id: string): Promise<void>;
    generatePaper(filter: PaperFilter): Promise<PaperGenerationRequest>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getQuestion(id: string): Promise<Question>;
    getQuestionStats(): Promise<Array<QuestionCountStats>>;
    getSettings(): Promise<Settings>;
    getSyllabus(): Promise<Array<SyllabusUnit>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchQuestions(searchText: string): Promise<Array<Question>>;
    updateQuestion(question: Question): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
}
