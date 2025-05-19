import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import PetSitterSurvey from "../../components/Sitter/PetSitterSurvey";
import PetSitterResults from "../../components/Sitter/PetSitterResults";
import { getApprovedPetSitters } from "../../services/petSitterService";
import GlobalSnackbar from "../../components/Global/GlobalSnackbar";

const PetSitterFinder = () => {
    const navigate = useNavigate();

    const [savedConditions] = useState(() => {
        const saved = sessionStorage.getItem("petSitterConditions");
        return saved ? JSON.parse(saved) : null;
    });

    const [selectedAges, setSelectedAges] = useState(() => {
        return (
            savedConditions?.selectedAges || {
                "20대": false,
                "30대": false,
                "40대": false,
                "50대이상": false,
            }
        );
    });

    const [hasPet, setHasPet] = useState(() => {
        return (
            savedConditions?.hasPet || {
                네: false,
                아니오: false,
                상관없어요: false,
            }
        );
    });

    const [hasSitterExperience, setHasSitterExperience] = useState(() => {
        return (
            savedConditions?.hasSitterExperience || {
                네: false,
                아니오: false,
                상관없어요: false,
            }
        );
    });

    const [step, setStep] = useState(() => {
        return savedConditions?.step || 1;
    });

    const [history, setHistory] = useState(() => {
        return savedConditions?.history || [];
    });

    const [showResults, setShowResults] = useState(() => {
        return savedConditions?.showResults || false;
    });

    const [progress, setProgress] = useState(() => {
        return savedConditions?.progress || 0;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filteredPetsitters, setFilteredPetsitters] = useState(() => {
        return savedConditions?.filteredPetsitters || [];
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    // 진행률 매핑
    const progressMapping = {
        1: 0,
        2: 35,
        3: 70,
        4: 100,
    };

    // 단계에 따른 진행률 업데이트
    useEffect(() => {
        setProgress(progressMapping[step] || 0);
    }, [step]);

    // 조건 변경 시 sessionStorage에 저장
    useEffect(() => {
        const conditions = {
            selectedAges,
            hasPet,
            hasSitterExperience,
            step,
            history,
            progress,
            showResults,
            filteredPetsitters,
        };
        sessionStorage.setItem("petSitterConditions", JSON.stringify(conditions));
    }, [selectedAges, hasPet, hasSitterExperience, step, history, progress, showResults, filteredPetsitters]);

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const resetSearch = () => {
        sessionStorage.removeItem("petSitterConditions");

        setStep(1);
        setProgress(0);
        setShowResults(false);
        setError(null);
        setFilteredPetsitters([]);
        setHistory([]);

        setSelectedAges({
            "20대": false,
            "30대": false,
            "40대": false,
            "50대이상": false,
        });

        setHasPet({
            네: false,
            아니오: false,
            상관없어요: false,
        });

        setHasSitterExperience({
            네: false,
            아니오: false,
            상관없어요: false,
        });
    };

    const handleNext = () => {
        switch (step) {
            case 1: // 연령대
                if (!Object.values(selectedAges).some((v) => v)) {
                    setSnackbar({
                        open: true,
                        message: "연령대를 하나 이상 선택해주세요.",
                        severity: "warning",
                    });
                    return;
                }

                const selectedAgeList = Object.keys(selectedAges).filter((age) => selectedAges[age]);
                setHistory([
                    ...history,
                    { question: "원하는 펫시터님의 연령대를 골라주세요", answer: selectedAgeList[0] },
                ]);

                setStep(2);
                break;

            case 2: // 반려동물 여부
                if (!Object.values(hasPet).some((v) => v)) {
                    setSnackbar({
                        open: true,
                        message: "선택지를 하나 선택해주세요.",
                        severity: "warning",
                    });
                    return;
                }

                const hasPetAnswer = Object.keys(hasPet).find((opt) => hasPet[opt]);
                setHistory([...history, { question: "반려동물을 키우고 있는 분을 찾을까요?", answer: hasPetAnswer }]);

                setStep(3);
                break;

            case 3: // 펫시터 경험 여부
                if (!Object.values(hasSitterExperience).some((v) => v)) {
                    setSnackbar({
                        open: true,
                        message: "선택지를 하나 선택해주세요.",
                        severity: "warning",
                    });
                    return;
                }

                const hasExpAnswer = Object.keys(hasSitterExperience).find((opt) => hasSitterExperience[opt]);
                setHistory([...history, { question: "임시보호 경험이 있으신 분을 찾으시나요?", answer: hasExpAnswer }]);

                setStep(4);
                fetchApprovedPetSitters();
                break;

            case 4: //결과
                setShowResults(true);
                break;
        }
    };

    const fetchApprovedPetSitters = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 선택된 옵션 추출
            const selectedAge = Object.keys(selectedAges).find((age) => selectedAges[age]);

            // 파라미터 객체 생성
            const params = {
                age: selectedAge,
            };

            // 반려동물 소유 여부 처리
            if (hasPet["네"]) {
                params.grown = true;
                params.petOwnership = true;
            } else if (hasPet["아니오"]) {
                params.grown = false;
                params.petOwnership = false;
            }

            // 펫시터 경험 여부 처리
            if (hasSitterExperience["네"]) {
                params.sitterExp = true;
            } else if (hasSitterExperience["아니오"]) {
                params.sitterExp = false;
            }

            // API 호출
            const response = await getApprovedPetSitters(params);

            // 서버 응답에서 데이터 추출
            if (response && response.data) {
                setFilteredPetsitters(response.data);
            } else {
                throw new Error("펫시터 데이터를 불러오는데 실패했습니다.");
            }
        } catch (error) {
            console.error("펫시터 검색 오류:", error);
            setError("펫시터 정보를 불러오는데 실패했습니다. 다시 시도해주세요.");

            setSnackbar({
                open: true,
                message: "펫시터 정보를 불러오는데 실패했습니다. 다시 시도해주세요.",
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 뒤로가기
    const handleBack = () => {
        if (showResults) {
            setShowResults(false);
        } else if (step > 1) {
            setStep(step - 1);
            setHistory(history.slice(0, -1));
        } else {
            navigate(-1);
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: "white",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* 헤더 */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handleBack} sx={{ p: 0, mr: 1 }}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" component="h1" fontWeight="bold" color="#363636" fontSize="18px">
                        펫시터 요청
                    </Typography>
                </Box>
            </Box>

            {/* 진행 표시 바 */}
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        bgcolor: "#e0e0e0",
                        height: "4px",
                        borderRadius: "2px",
                        position: "relative",
                    }}
                >
                    <Box
                        sx={{
                            width: `${progress}%`,
                            bgcolor: "#E9A260",
                            height: "100%",
                            borderRadius: "2px",
                        }}
                    />
                </Box>
                <Typography
                    sx={{
                        ml: 1,
                        color: "#E9A260",
                        fontWeight: "bold",
                    }}
                >
                    {Math.round(progress)}%
                </Typography>
            </Box>

            {/* 대화 내용 */}
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    mb: 2,
                    position: "relative",
                }}
            >
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <CircularProgress sx={{ color: "#E9A260" }} />
                    </Box>
                ) : showResults ? (
                    // 결과 화면 - PetSitterResults
                    <PetSitterResults
                        filteredPetsitters={filteredPetsitters}
                        error={error}
                        showResults={showResults}
                        resetSearch={resetSearch}
                    />
                ) : (
                    // 질문 화면 - PetSitterSurvey
                    <PetSitterSurvey
                        step={step}
                        history={history}
                        selectedAges={selectedAges}
                        setSelectedAges={setSelectedAges}
                        hasPet={hasPet}
                        setHasPet={setHasPet}
                        hasSitterExperience={hasSitterExperience}
                        setHasSitterExperience={setHasSitterExperience}
                        handleNext={handleNext}
                        handleBack={handleBack}
                    />
                )}
            </Box>

            {/* GlobalSnackbar */}
            <GlobalSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                handleSnackbarClose={handleSnackbarClose}
            />
        </Box>
    );
};

export default PetSitterFinder;
