package com.health.yogiodigym.member.repository;

import com.health.yogiodigym.admin.dto.MemberDto.MemberResponseDto;
import com.health.yogiodigym.member.entity.Member;
import com.health.yogiodigym.member.status.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    @Modifying
    int deleteByDropDateBeforeAndStatus(@Param("dropDate") LocalDate dropDate, @Param("status") MemberStatus status);

    @Query("SELECT m FROM Member m " +
            "ORDER BY CASE " +
            "WHEN m.status = 'ACTIVE' THEN 1 " +
            "WHEN m.status = 'INCOMPLETE' THEN 2 " +
            "WHEN m.status = 'INACTIVE' THEN 3 " +
            "WHEN m.status = 'SUSPENDED' THEN 4 " +
            "WHEN m.status = 'BAN' THEN 5 " +
            "ELSE 6 END, m.name ASC")
    List<MemberResponseDto> getAllMembers();

    @Query("select m from Member m " +
            "where lower(m.name) like lower(concat('%', :memberKeyword, '%')) " +
            "or lower(substring(m.email, 1, locate('@', m.email)-1)) like lower(concat('%', :memberKeyword, '%')) " +
            "order by case " +
            "when m.status = 'ACTIVE' then 1 " +
            "when m.status = 'INCOMPLETE' then 2 " +
            "when m.status = 'SUSPENDED' then 3 " +
            "when m.status = 'INACTIVE' then 4 " +
            "when m.status = 'BAN' then 5 " +
            "else 6 " +
            "end, m.name asc")
    List<Member> searchMembers(@Param("memberKeyword") String memberKeyword);
}
