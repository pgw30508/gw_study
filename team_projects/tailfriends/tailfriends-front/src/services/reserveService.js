import instance from "./axiosInstance.js";

const API_URL = "/reserve"; // 상대 URL

export const getFacilityListsToReserve = ({
    page = 1,
    size = 10,
    sortBy = "starPoint",
    category = "HOTEL",
    location,
    today,
}) => {
    return instance
        .get(`${API_URL}/facility/lists`, {
            params: {
                latitude: location.latitude,
                longitude: location.longitude,
                category,
                sortBy,
                day: today,
                page,
                size,
            },
        })
        .then((response) => response.data)
        .catch((error) => {
            console.error("시설 목록을 불러오는 데 실패했습니다.", error);
            throw error; // 에러를 다시 던져서 호출한 곳에서 처리
        });
};

export const getFacilityToReserveById = async (id, sortBy = "recent") => {
    try {
        const response = await instance.get(`/facility/${id}/detail?sortBy=${sortBy}`);
        return response;
    } catch (error) {
        console.error("시설 상세 정보 로딩 실패:", error);
        throw error;
    }
};

export const addReview = async ({ formData }) => {
    return await instance
        .post(`${API_URL}/facility/review`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then((response) => response)
        .catch((error) => {
            console.error("리뷰 업로드에 실패했습니다.", error);
            throw error;
        });
};

export const getFacilityNameAndThumbnail = async (id) => {
    if (!id) return;
    return await instance
        .get(`${API_URL}/facility/${id}/review`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("예약 정보를 불러오는 데 실패했습니다.", error);
            throw error; // 에러를 다시 던져서 호출한 곳에서 처리
        });
};

export const addTempReserve = async (reserveData) => {
    return await instance.post(`${API_URL}/temp`, reserveData, {
        headers: {
            "Content-Type": "application/json",
        },
    });
};

// ✅ 예약 목록을 불러오는 요청 함수
export const fetchMyReserveList = async () => {
    return await instance.get(`${API_URL}/my`);
};

export const getReserveDetail = async (id) => {
    return await instance.get(`${API_URL}/${id}`);
};

export const cancelReserve = (id) => {
    return instance
        .delete(`${API_URL}`, {
            params: {
                id,
            },
        })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            throw error.response.data;
        });
};

export const putReview = async ({ id, formData }) => {
    return await instance
        .put(`${API_URL}/facility/review/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then((response) => response)
        .catch((error) => {
            console.error("리뷰 수정에 실패했습니다.", error);
            throw error;
        });
};

export const deleteReview = async (id) => {
    return await instance
        .delete(`${API_URL}/facility/review/${id}`)
        .then((response) => response.data)
        .catch((error) => {
            console.error("리뷰 삭제에 실패했습니다.", error);
            throw error;
        });
};
