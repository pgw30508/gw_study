import instance from "./axiosInstance";

const API_URL = "/petsta"; // 상대 URL

export const getPostLists = (page) => {
    return instance
        .get(`${API_URL}/post/lists?page=${page}&size=5`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("게시글을 불러오는 데 실패했습니다.", error);
            throw error; // 에러를 다시 던져서 호출한 곳에서 처리
        });
};

export const getPostById = (postId) => {
    return instance
        .get(`${API_URL}/post/${postId}`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("게시글을 불러오는 데 실패했습니다.", error);
            throw error; // 에러를 다시 던져서 호출한 곳에서 처리
        });
};

export const updatePost = (postId, { content }) => {
    return instance
        .patch(`${API_URL}/post/${postId}`, { content })
        .then((response) => response.data)
        .catch((error) => {
            console.error("게시글 수정에 실패했습니다.", error);
            throw error;
        });
};

export const addPhoto = async (formData) => {
    return await instance.post(`${API_URL}/post/add/photo`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const addVideo = async (formData) => {
    return await instance.post(`${API_URL}/post/add/video`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const addComment = async (postId, formData) => {
    return await instance.post(`${API_URL}/post/${postId}/add/comment`, formData, {
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const deletePetstaComment = async (commentId) => {
    return await instance.delete(`${API_URL}/post/comment/${commentId}`);
};

export const deletePetstaPost = async (postId) => {
    return await instance.delete(`${API_URL}/post/${postId}`);
};

export const toggleLike = (postId) => {
    return instance
        .post(`${API_URL}/post/${postId}/like`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("좋아요 토글에 실패했습니다.", error);
            throw error;
        });
};

export const toggleBookmark = (postId) => {
    return instance
        .post(`${API_URL}/post/${postId}/bookmark`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("북마크 토글에 실패했습니다.", error);
            throw error;
        });
};

export const getParentComments = async (postId) => {
    return await instance
        .get(`${API_URL}/post/${postId}/comments`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("댓글을 불러오는 데 실패했습니다.", error);
            throw error;
        });
};

export const getReplyComments = async (commentId) => {
    return await instance
        .get(`${API_URL}/post/${commentId}/replies`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("댓글을 불러오는 데 실패했습니다.", error);
            throw error;
        });
};

export const getUserPage = async (userId) => {
    return await instance
        .get(`${API_URL}/users/${userId}/page`)
        .then((res) => res.data)
        .catch((error) => {
            console.error("마이페이지 호출 실패", error);
            throw error;
        });
};

export const getUserName = async (userId) => {
    return await instance
        .get(`${API_URL}/users/${userId}/name`)
        .then((res) => res.data)
        .catch((error) => {
            console.error("닉네임 호출 실패", error);
            throw error;
        });
};

export const getFollowdUsers = async (userId, page = 0, size = 20) => {
    return await instance
        .get(`${API_URL}/users/${userId}/followers?page=${page}&size=${size}`)
        .then((res) => res.data)
        .catch((error) => {
            console.error("팔로워 호출 실패", error);
            throw error;
        });
};

export const getFollowingUsers = async (userId, page = 0, size = 20) => {
    return await instance
        .get(`${API_URL}/users/${userId}/followings?page=${page}&size=${size}`)
        .then((res) => res.data)
        .catch((error) => {
            console.error("팔로잉 호출 실패", error);
            throw error;
        });
};
