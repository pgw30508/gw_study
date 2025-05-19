package com.health.yogiodigym.member.service.impl;

import com.health.yogiodigym.member.UserInfo.GoogleUserInfo;
import com.health.yogiodigym.member.UserInfo.KakaoUserInfo;
import com.health.yogiodigym.member.UserInfo.NaverUserInfo;
import com.health.yogiodigym.member.UserInfo.OAuth2UserInfo;
import com.health.yogiodigym.member.entity.Member;
import com.health.yogiodigym.member.entity.MemberOAuth2User;
import com.health.yogiodigym.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Map;

import static com.health.yogiodigym.member.status.MemberStatus.INCOMPLETE;
import static com.health.yogiodigym.member.auth.Role.ROLE_USER;

@Slf4j
@RequiredArgsConstructor
@Service
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> oAuthAttributes = oAuth2User.getAttributes();

        log.info("{} OAuth2 Response: {}", userRequest.getClientRegistration().getRegistrationId(), oAuthAttributes);

        OAuth2UserInfo oAuth2UserInfo = null;
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        if (registrationId.equals("kakao")) {
            oAuth2UserInfo = new KakaoUserInfo(oAuthAttributes);
        } else if (registrationId.equals("naver")) {
            oAuth2UserInfo = new NaverUserInfo(oAuthAttributes);
        } else if (registrationId.equals("google")) {
            oAuth2UserInfo = new GoogleUserInfo(oAuthAttributes);
        }

        Member oAuthloginMember = memberRepository.findByEmail(oAuth2UserInfo.getEmail()).orElse(null);
        if (oAuthloginMember != null) {
            MemberOAuth2User principal = new MemberOAuth2User(oAuthloginMember, oAuthAttributes);
            checkAccountStatus(principal);

            return principal;
        } else {
            Member newOAuthMember = Member.builder()
                    .name(oAuth2UserInfo.getName())
                    .email(oAuth2UserInfo.getEmail())
                    .profile(oAuth2UserInfo.getProfile())
                    .roles(EnumSet.of(ROLE_USER))
                    .status(INCOMPLETE)
                    .build();

            return new MemberOAuth2User(newOAuthMember, oAuthAttributes);
        }
    }

    private void checkAccountStatus(MemberOAuth2User memberOAuth2User) {
        if (!memberOAuth2User.isAccountNonExpired()) {
            throw new AccountExpiredException("Account is expired");
        }
        if (!memberOAuth2User.isCredentialsNonExpired()) {
            throw new CredentialsExpiredException("Credentials are expired");
        }
        if (!memberOAuth2User.isEnabled()) {
            throw new DisabledException("Account is disabled");
        }
        if (!memberOAuth2User.isAccountNonLocked()) {
            throw new LockedException("Account is locked");
        }
    }
}