export const getPetCountEnum = (petCountStr) => {
    switch (petCountStr) {
        case "1마리":
            return "ONE";
        case "2마리":
            return "TWO";
        case "3마리 이상":
            return "THREE_PLUS";
        default:
            return "ONE";
    }
};

export const getPetTypeId = (petTypeStr) => {
    if (!petTypeStr) return null;

    switch (petTypeStr) {
        case "강아지":
            return 1;
        case "고양이":
            return 2;
        case "앵무새":
            return 3;
        case "햄스터":
            return 4;
        case "기타":
            return 5;
        default:
            return null;
    }
};

// 선택된 반려동물 타입 목록 가져오기
export const getSelectedPetTypes = (petTypes) => {
    return Object.keys(petTypes).filter((type) => petTypes[type]);
};

// 반려동물 타입 목록을 문자열로 변환
export const formatPetTypes = (petTypes) => {
    const selectedTypes = getSelectedPetTypes(petTypes);
    return selectedTypes.join(", ");
};

// 선택된 반려동물 타입들의 ID 목록 가져오기
export const getSelectedPetTypeIds = (petTypes) => {
    const selectedTypes = getSelectedPetTypes(petTypes);
    return selectedTypes.map((type) => getPetTypeId(type)).filter((id) => id !== null);
};

export const createPetSitterRequestData = (formData) => {
    const { selectedAges, hasPet, petTypes, petCount, sitterExperience, houseType, commentText } = formData;

    // 선택된 모든 반려동물 타입들 가져오기
    const selectedPetTypes = getSelectedPetTypes(petTypes);
    const selectedPetTypesStr = formatPetTypes(petTypes);
    const selectedPetTypeIds = getSelectedPetTypeIds(petTypes);

    return {
        userId: null,
        age: Object.keys(selectedAges).find((key) => selectedAges[key]) || "20대",
        houseType: Object.keys(houseType).find((key) => houseType[key]) || "아파트",
        comment: commentText || "제 가족이라는 마음으로 돌봐드려요 ♥",
        grown: hasPet["네, 키우고 있습니다"] ? true : false,

        petCount: getPetCountEnum(Object.keys(petCount).find((key) => petCount[key])),

        sitterExp: sitterExperience["네, 해본적 있습니다"] ? true : false,

        petTypeId: selectedPetTypes.length > 0 ? getPetTypeId(selectedPetTypes[0]) : null,

        petTypesFormatted: selectedPetTypesStr,
        petTypeIds: selectedPetTypeIds,
    };
};

export const createFormData = (petSitterData, imageBlob) => {
    const formData = new FormData();

    formData.append("data", new Blob([JSON.stringify(petSitterData)], { type: "application/json" }));

    if (imageBlob) {
        formData.append("image", imageBlob, "profile.jpg");
    }

    return formData;
};
