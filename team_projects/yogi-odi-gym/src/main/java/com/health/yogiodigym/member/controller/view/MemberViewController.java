package com.health.yogiodigym.member.controller.view;

import com.health.yogiodigym.member.entity.MemberOAuth2User;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import static com.health.yogiodigym.member.status.MemberStatus.INCOMPLETE;

@Controller
@RequestMapping("/member")
public class MemberViewController {

    @GetMapping("/login")
    public String login(Authentication authentication) {
        if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
            return "redirect:/dashboard";
        }

        return "member/login";
    }

    @GetMapping("/regist")
    public String regist(Authentication authentication) {
        if (authentication != null && (authentication.getPrincipal() instanceof MemberOAuth2User principal)) {
            if (principal.getMember().getStatus() != INCOMPLETE) {
                return "redirect:/dashboard";
            }
        }

        return "member/regist";
    }

    @GetMapping("/find-pwd")
    public String findPwd() {

        return "member/find_pwd";
    }
}