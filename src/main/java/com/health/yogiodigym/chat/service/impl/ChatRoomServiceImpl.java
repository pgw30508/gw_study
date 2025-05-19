package com.health.yogiodigym.chat.service.impl;

import static com.health.yogiodigym.chat.config.ChatConstants.ENTER_CHAT_ROOM_MESSAGE_PREFIX;
import static com.health.yogiodigym.chat.config.ChatConstants.QUIT_CHAT_ROOM_MESSAGE_SUFFIX;

import com.health.yogiodigym.chat.dto.ChatRoomDto.ChatRoomResponseDto;
import com.health.yogiodigym.chat.dto.MessageDto.MessageResponseDto;
import com.health.yogiodigym.chat.entity.ChatMessage;
import com.health.yogiodigym.chat.entity.ChatParticipant;
import com.health.yogiodigym.chat.entity.ChatRoom;
import com.health.yogiodigym.chat.repository.ChatMessageRepository;
import com.health.yogiodigym.chat.repository.ChatParticipantRepository;
import com.health.yogiodigym.chat.repository.ChatRoomRepository;
import com.health.yogiodigym.chat.service.ChatRoomService;
import com.health.yogiodigym.chat.service.KafkaProducerService;
import com.health.yogiodigym.common.exception.AlreadyChatParticipantException;
import com.health.yogiodigym.common.exception.ChatRoomNotFoundException;
import com.health.yogiodigym.common.exception.ForbiddenException;
import com.health.yogiodigym.common.exception.KickInstructorException;
import com.health.yogiodigym.common.exception.LessonNotFoundException;
import com.health.yogiodigym.common.exception.MemberNotFoundException;
import com.health.yogiodigym.common.exception.MemberNotInChatRoomException;
import com.health.yogiodigym.common.exception.MemberNotInLessonException;
import com.health.yogiodigym.lesson.entity.Lesson;
import com.health.yogiodigym.lesson.entity.LessonEnrollment;
import com.health.yogiodigym.lesson.repository.LessonEnrollmentRepository;
import com.health.yogiodigym.lesson.repository.LessonRepository;
import com.health.yogiodigym.member.auth.Role;
import com.health.yogiodigym.member.entity.Member;
import com.health.yogiodigym.member.repository.MemberRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatRoomServiceImpl implements ChatRoomService {

    private static final int CHAT_ROOM_ID_LENGTH = 10;

    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final LessonEnrollmentRepository lessonEnrollmentRepository;
    private final KafkaProducerService kafkaProducerService;
    private final LessonRepository lessonRepository;

    @Override
    public void enterChatRoom(Member member, String roomId) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new ChatRoomNotFoundException(roomId));

        validateAlreadyChatParticipant(member, chatRoom);

        ChatParticipant chatParticipant = ChatParticipant.builder()
                .member(member)
                .chatRoom(chatRoom)
                .lastReadMessageId(0L)
                .build();
        chatParticipantRepository.save(chatParticipant);

        sendChatMessage(member, roomId, member.getName() + ENTER_CHAT_ROOM_MESSAGE_PREFIX);
    }

    private void validateAlreadyChatParticipant(Member member, ChatRoom chatRoom) {
        if (chatParticipantRepository.existsByMemberAndChatRoom(member, chatRoom)) {
            throw new AlreadyChatParticipantException();
        }
    }

    @Override
    public ChatRoom createChatRoom(Member member, boolean isGroupChat) {
        ChatRoom chatRoom = ChatRoom.builder()
                .roomId(createChatRoomId())
                .isGroupChat(isGroupChat)
                .build();
        chatRoomRepository.save(chatRoom);

        ChatParticipant chatParticipant = ChatParticipant.builder()
                .chatRoom(chatRoom)
                .member(member)
                .lastReadMessageId(0L)
                .build();
        chatParticipantRepository.save(chatParticipant);

        return chatRoom;
    }

    private String createChatRoomId() {
        return UUID.randomUUID().toString().substring(0, CHAT_ROOM_ID_LENGTH);
    }

    @Override
    public void deleteChatRoom(ChatRoom chatRoom) {
        chatMessageRepository.deleteAllByChatRoomInBatch(chatRoom);
        chatParticipantRepository.deleteByChatRoom(chatRoom);
        chatRoomRepository.delete(chatRoom);
    }

    @Override
    public ChatRoomResponseDto getChatRoomDetail(String roomId) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new ChatRoomNotFoundException(roomId));

        Lesson lesson = lessonRepository.findByChatRoom(chatRoom)
                .orElseThrow(LessonNotFoundException::new);

        return new ChatRoomResponseDto(lesson);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomResponseDto> getChatRooms(Member member) {
        List<LessonEnrollment> lessonEnrollments = lessonEnrollmentRepository.findAllByMember(member);
        return lessonEnrollments.stream()
                .map(l -> {
                    Lesson lesson = l.getLesson();
                    ChatRoom chatRoom = lesson.getChatRoom();
                    ChatParticipant chatParticipant = chatParticipantRepository.findByMemberAndChatRoom(member, chatRoom)
                            .orElseThrow(() -> new MemberNotInChatRoomException(member.getId()));
                    Long lastReadMessageId = chatParticipant.getLastReadMessageId();
                    List<ChatMessage> chatMessages = chatMessageRepository.findByChatRoomAndIdGreaterThan(chatRoom, lastReadMessageId);

                    return new ChatRoomResponseDto(lesson, chatMessages.size());
                })
                .toList();
    }

    @Override
    public void kickMember(Member instructor, Long memberId, String chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(chatRoomId)
                .orElseThrow(() -> new ChatRoomNotFoundException(chatRoomId));
        Lesson lesson = lessonRepository.findByChatRoom(chatRoom)
                .orElseThrow(LessonNotFoundException::new);

        if (lesson.getMaster().getId().equals(memberId)) {
            throw new KickInstructorException();
        }
        chatParticipantRepository.findByMemberAndChatRoom(instructor, chatRoom)
                .orElseThrow(() -> new MemberNotInChatRoomException(instructor.getId()));

        if (!instructor.getRoles().contains(Role.ROLE_MASTER)) {
            throw new ForbiddenException();
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException(memberId));
        ChatParticipant memberParticipant = chatParticipantRepository.findByMemberAndChatRoom(member, chatRoom)
                .orElseThrow(() -> new MemberNotInChatRoomException(memberId));
        chatParticipantRepository.delete(memberParticipant);

        LessonEnrollment lessonEnrollment = lessonEnrollmentRepository.findByLessonAndMember(lesson, member)
                .orElseThrow(MemberNotInLessonException::new);
        lessonEnrollmentRepository.delete(lessonEnrollment);
    }

    @Override
    public void quitChatRoom(Member member, String roomId) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new ChatRoomNotFoundException(roomId));

        ChatParticipant chatParticipant = chatParticipantRepository.findByMemberAndChatRoom(member, chatRoom)
                .orElseThrow(() -> new MemberNotInChatRoomException(member.getId()));
        chatParticipantRepository.delete(chatParticipant);

        sendChatMessage(member, roomId, member.getName() + QUIT_CHAT_ROOM_MESSAGE_SUFFIX);
    }

    @Override
    public void checkParticipant(Long memberId, String roomId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException(memberId));

        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new ChatRoomNotFoundException(roomId));

        validateNotInChatParticipant(member, chatRoom);
    }

    private void validateNotInChatParticipant(Member member, ChatRoom chatRoom) {
        if (!chatParticipantRepository.existsByMemberAndChatRoom(member, chatRoom)) {
            throw new MemberNotInChatRoomException();
        }
    }

    private void sendChatMessage(Member member, String roomId, String content) {
        MessageResponseDto message = MessageResponseDto.builder()
                .senderId(member.getId())
                .senderName(member.getName())
                .roomId(roomId)
                .message(content)
                .profileUrl(member.getProfile())
                .sendDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .build();
        kafkaProducerService.sendMessage(message);
    }

}
