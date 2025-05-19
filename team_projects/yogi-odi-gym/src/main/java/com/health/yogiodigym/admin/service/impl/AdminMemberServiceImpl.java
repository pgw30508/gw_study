package com.health.yogiodigym.admin.service.impl;

import com.health.yogiodigym.admin.dto.MemberDto.*;
import com.health.yogiodigym.admin.service.service.AdminMemberService;
import com.health.yogiodigym.common.exception.MemberNotFoundException;
import com.health.yogiodigym.member.status.MemberStatus;
import com.health.yogiodigym.member.entity.Member;
import com.health.yogiodigym.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminMemberServiceImpl implements AdminMemberService {

    private final MemberRepository memberRepository;

    @Override
    public List<MemberResponseDto> getAllMembers() {
        return memberRepository.getAllMembers();
    }

    @Override
    public List<MemberResponseDto> searchMembers(String memberKeyword) {
        List<Member> members = memberRepository.searchMembers(memberKeyword);

        return members.stream().map(MemberResponseDto::from).toList();
    }

    @Override
    @Transactional
    public void setInactiveStatus(List<Long> memberIds) {
        for(Long memberId : memberIds){
            Member inActiveMember = memberRepository.findById(memberId).orElseThrow(() -> new MemberNotFoundException(memberId));
            inActiveMember.setInactive();
        }
    }
}
