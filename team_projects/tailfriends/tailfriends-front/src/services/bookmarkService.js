import instance from "./axiosInstance.js";

const API_URL = "/bookmarks";

// 전체 북마크 (펫스타 + 게시물)
export const getAllBookmarks = async () => {
    return instance.get(`${API_URL}`).then((response) => response.data.data);
};

// 펫스타 북마크
export const getPetstaBookmarks = async (page = 0, size = 20) => {
    try {
        const response = await instance.get(`${API_URL}/petsta`, {
            params: { page, size },
        });

        if (!response.data) return [];

        return response.data.data || [];
    } catch (error) {
        console.error("펫스타 북마크 요청 실패:", error);
        return [];
    }
};

// 게시판 북마크
export const getBoardBookmarks = async (page = 0, size = 20, boardTypeId = null) => {
    const params = { page, size };
    if (boardTypeId) {
        params.boardTypeId = boardTypeId;
    }

    return instance
        .get(`${API_URL}/posts`, {
            params,
        })
        .then((response) => response.data.data);
};

// 펫스타 북마크 토글
export const togglePetstaBookmark = async (postId) => {
    return instance.post(`/petsta/post/${postId}/bookmark`).then((response) => response.data);
};

// 게시판 북마크 토글
export const toggleBoardBookmark = async (postId) => {
    return instance.post(`/board/${postId}/bookmark`).then((response) => response.data);
};
