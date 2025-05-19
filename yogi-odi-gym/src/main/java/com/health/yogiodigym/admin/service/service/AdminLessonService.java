package com.health.yogiodigym.admin.service.service;

import com.health.yogiodigym.admin.dto.LessonDto.*;

import java.util.List;

public interface AdminLessonService {

    List<LessonResponseDto> getAllLessons();

    List<LessonResponseDto> adminSearchLessons(String lessonKeyword);

    void deleteAllById(List<Long> ids);
}
