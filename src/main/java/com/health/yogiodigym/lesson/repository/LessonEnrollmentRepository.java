package com.health.yogiodigym.lesson.repository;

import com.health.yogiodigym.lesson.entity.Lesson;
import com.health.yogiodigym.lesson.entity.LessonEnrollment;
import com.health.yogiodigym.member.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface LessonEnrollmentRepository extends JpaRepository<LessonEnrollment, Long> {

    boolean existsByLessonAndMember(Lesson lesson, Member member);

    Optional<LessonEnrollment> findByLessonAndMember(Lesson lesson, Member member);

    List<LessonEnrollment> findAllByMember(Member member);

    @EntityGraph(attributePaths = {"lesson"})
    Page<LessonEnrollment> findByMember_Id(Long memberId, Pageable pageable);
}
