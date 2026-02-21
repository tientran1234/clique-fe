import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface Profile {
    id: string;
    email: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    bio: string;
    createdAt: string;
}

export interface CreateProfileDto {
    email: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    bio: string;
}

export interface UpdateProfileDto {
    name?: string;
    age?: number;
    gender?: "male" | "female" | "other";
    bio?: string;
}

export interface GetProfilesParams {
    page?: number;
    limit?: number;
    search?: string;
    gender?: "male" | "female" | "other";
    minAge?: number;
    maxAge?: number;
    orderBy?: "asc" | "desc";
    sortBy?: "createdAt" | "age" | "name";
}

export interface ProfilesResponse {
    items: Profile[];
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
    statsAll?: {
        male: number;
        female: number;
        other: number;
    };
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ============================================
// LIKES
// ============================================
export interface CreateLikeDto {
    senderId: string;
    receiverId: string;
}

export interface CreateLikeResponse {
    id: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    isMatch: boolean;
    matchId?: string;
}

export interface Like {
    id: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
}

export interface GetLikesResponse {
    items: Like[];
    totalItems: number;
}

// ============================================
// MATCHES
// ============================================
export interface Availability {
    id: string;
    userId: string;
    matchId: string | null;
    date: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
}

export interface Match {
    id: string;
    userAId: string;
    userBId: string;
    matchedAt: string;
    hasScheduledDate: boolean;
    proposedDate: string | null;
    proposedTime: string | null;
    userA?: Profile;
    userB?: Profile;
    availabilities?: Availability[];
}

export interface GetMatchesResponse {
    items: Match[];
    totalItems: number;
}

// ============================================
// AVAILABILITY
// ============================================
export interface CreateAvailabilityDto {
    userId: string;
    matchId: string;
    slots: Array<{
        date: string; // ISO datetime
        startTime: string; // "10:00"
        endTime: string; // "12:00"
    }>;
}

export interface CreateAvailabilityResponse {
    items: Array<{
        id: string;
        userId: string;
        matchId: string;
        date: string;
        startTime: string;
        endTime: string;
        createdAt: string;
    }>;
    commonSlot: {
        date: string;
        startTime: string;
        endTime: string;
    } | null;
    message: string;
}

// ============================================
// API EXPORTS
// ============================================
export const profilesApi = {
    getAll: (params?: GetProfilesParams) =>
        apiClient.get<ProfilesResponse>('/profiles', { params }),

    getProfiles: async (params?: GetProfilesParams): Promise<ProfilesResponse> => {
        const response = await apiClient.get('/profiles', { params })
        return response.data
    },

    getProfile: async (id: string): Promise<Profile | null> => {
        const response = await apiClient.get(`/profiles/${id}`)
        return response.data.item
    },

    getProfileByEmail: async (email: string): Promise<Profile | null> => {
        const response = await apiClient.get(`/profiles/by-email/${email}`)
        return response.data.item
    },

    createProfile: async (data: CreateProfileDto): Promise<Profile> => {
        const response = await apiClient.post('/profiles', data)
        return response.data.item
    },

    updateProfile: async (id: string, data: UpdateProfileDto): Promise<Profile> => {
        const response = await apiClient.put(`/profiles/${id}`, { id, ...data })
        return response.data.item
    },

    deleteProfile: async (id: string): Promise<void> => {
        await apiClient.delete(`/profiles/${id}`)
    },
}

export const likesApi = {
    create: async (data: CreateLikeDto): Promise<CreateLikeResponse> => {
        const response = await apiClient.post<{ item: CreateLikeResponse }>('/likes', data)
        return response.data.item
    },

    getSent: async (userId: string): Promise<GetLikesResponse> => {
        const response = await apiClient.get<GetLikesResponse>('/likes', { params: { userId, type: 'sent' } })
        return response.data
    },

    getReceived: async (userId: string): Promise<GetLikesResponse> => {
        const response = await apiClient.get<GetLikesResponse>('/likes', { params: { userId, type: 'received' } })
        return response.data
    },
}

export const matchesApi = {
    getAll: async (userId: string): Promise<GetMatchesResponse> => {
        const response = await apiClient.get<GetMatchesResponse>('/matches', { params: { userId } })
        return response.data
    },

    getOne: async (id: string): Promise<Match> => {
        const response = await apiClient.get<{ item: Match }>(`/matches/${id}`)
        return response.data.item
    },
}

export const availabilityApi = {
    create: async (data: CreateAvailabilityDto): Promise<CreateAvailabilityResponse> => {
        const response = await apiClient.post<CreateAvailabilityResponse>('/availability', data)
        return response.data
    },

    getAll: async (matchId: string): Promise<{ items: Availability[], totalItems: number }> => {
        const response = await apiClient.get<{ items: Availability[], totalItems: number }>('/availability', { params: { matchId } })
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/availability/${id}`)
    },
}
