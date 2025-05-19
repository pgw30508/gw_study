package com.health.yogiodigym.calendar.service.impl;

import com.health.yogiodigym.calendar.dto.CalendarExerciseDto.*;
import com.health.yogiodigym.calendar.entity.CalendarExercise;
import com.health.yogiodigym.calendar.entity.DataExercise;
import com.health.yogiodigym.calendar.repository.CalendarExerciseRepository;
import com.health.yogiodigym.calendar.repository.DataExerciseRepository;
import com.health.yogiodigym.calendar.service.CalendarExerciseService;
import com.health.yogiodigym.common.exception.DataExerciseNotFoundException;
import com.health.yogiodigym.common.exception.ExerciseNotFoundException;
import com.health.yogiodigym.common.exception.MemberNotFoundException;
import com.health.yogiodigym.member.entity.Member;
import com.health.yogiodigym.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarExerciseServiceImpl implements CalendarExerciseService {
    
    private final CalendarExerciseRepository calendarExerciseRepository;

    private final MemberRepository memberRepository;

    private final DataExerciseRepository dataExerciseRepository;


    @Override
    @Transactional(readOnly = true)
    public List<CalendarExerciseSelectDto> findByMemberId(Long memberId) {
        return calendarExerciseRepository.findByMemberId(memberId)
                .stream()
                .map(CalendarExerciseSelectDto::new)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public List<CalendarExerciseSelectDto> findByDateAndMemberId(LocalDate selectedDate, Long memberId) {
        return calendarExerciseRepository.findByDateAndMemberId(selectedDate,memberId)
                .stream()
                .map(CalendarExerciseSelectDto::new)
                .collect(Collectors.toList());
    }


    @Override
    public void postExerciseByDate(CalendarExerciseInsertDto dto) {

        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new MemberNotFoundException(dto.getMemberId()));


        DataExercise dataExercise = dataExerciseRepository.findById(dto.getExerciseId())
                .orElseThrow(() -> new DataExerciseNotFoundException() );


        CalendarExercise postExercise = CalendarExercise.builder()
                .name(dto.getName())
                .time(dto.getTime())
                .calories(dto.getCalories())
                .date(dto.getDate())
                .member(member)
                .dataExercise(dataExercise)
                .build();

        calendarExerciseRepository.save(postExercise);
    }



@Override
public void putExerciseByDate(CalendarExerciseUpdateDto dto) {

    CalendarExercise exercise = calendarExerciseRepository.findById(dto.getId())
            .orElseThrow(() -> new ExerciseNotFoundException());

    DataExercise dataExercise = exercise.getDataExercise();
    if (!dataExercise.getId().equals(dto.getExerciseId())) {
        dataExercise = dataExerciseRepository.findById(dto.getExerciseId())
                .orElseThrow(() -> new DataExerciseNotFoundException());
    }

    Member member = exercise.getMember();
    if (!member.getId().equals(dto.getMemberId())) {
        member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new MemberNotFoundException(dto.getMemberId()));
    }

    CalendarExercise updatedExercise = CalendarExercise.builder()
            .id(dto.getId())
            .name(dto.getName())
            .dataExercise(dataExercise)
            .member(member)
            .time(dto.getTime())
            .calories(dto.getCalories())
            .date(dto.getDate())
            .build();
    calendarExerciseRepository.save(updatedExercise);
}

    @Override
    public void deleteExerciseByDate(Long id) {
        calendarExerciseRepository.deleteById(id);
    }
}
