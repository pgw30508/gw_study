package com.health.yogiodigym.lesson.controller;

import com.health.yogiodigym.lesson.dto.LessonDto.*;
import com.health.yogiodigym.lesson.dto.MemberLatLonDto;
import com.health.yogiodigym.lesson.service.LessonService;
import com.health.yogiodigym.member.auth.Role;
import com.health.yogiodigym.member.entity.Member;
import com.health.yogiodigym.member.entity.MemberOAuth2User;
import com.health.yogiodigym.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Set;

import static com.health.yogiodigym.member.auth.Role.ROLE_ADMIN;
import static com.health.yogiodigym.member.auth.Role.ROLE_MASTER;

@Controller
@RequestMapping("/lesson")
@RequiredArgsConstructor
public class LessonViewController {

    private final LessonService lessonService;

    @GetMapping
    public String showLesson(Model model,
                             @AuthenticationPrincipal MemberOAuth2User loginUser) {
        Member loginMember = loginUser.getMember();

        Set<Role> roles = loginUser.getMember().getRoles();

        if (roles.contains(ROLE_MASTER)) {
            model.addAttribute("role", "master");
        } else {
            model.addAttribute("role", "user");
        }

        model.addAttribute("member", new MemberLatLonDto(loginMember));
        model.addAttribute("categories", lessonService.getCategoriesByCode("lesson"));

        return "lesson/lesson";
    }

    @GetMapping("/register")
    public String showLessonRegister(Model model,
                                     @AuthenticationPrincipal MemberOAuth2User loginUser) {
        Member loginMember = loginUser.getMember();

        model.addAttribute("member", new MemberLatLonDto(loginMember));
        model.addAttribute("categories", lessonService.getCategoriesByCode("lesson"));

        return "lesson/register";
    }

    @GetMapping("/{id}")
    public String showLessonDetail(@PathVariable Long id, Model model,
                                   @AuthenticationPrincipal MemberOAuth2User loginUser) {
        Member loginMember = loginUser.getMember();

        model.addAttribute("member", new MemberLatLonDto(loginMember));
        model.addAttribute("lesson", lessonService.findLessonById(id));
        return "lesson/detail";
    }

    @GetMapping("/{lessonId}/edit")
    public String showLessonUpdate(@PathVariable Long lessonId, Model model) {
        LessonDetailDto lessonDetailDto = lessonService.findLessonById(lessonId);

        model.addAttribute("daysSelected", lessonService.daysSelected(lessonDetailDto.getDays()));
        model.addAttribute("categories", lessonService.getCategoriesByCode("lesson"));
        model.addAttribute("lesson", lessonDetailDto);
        return "lesson/edit";
    }


}