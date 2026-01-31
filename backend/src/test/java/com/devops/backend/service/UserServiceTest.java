package com.devops.backend.service;

import com.devops.backend.model.User;
import com.devops.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldReturnAllUsers() {

        // GIVEN
        User user1 = new User("Alice", "alice@test.com");
        User user2 = new User("Bob", "bob@test.com");

        when(userRepository.findAll())
                .thenReturn(List.of(user1, user2));

        // WHEN
        List<User> result = userService.getAllUsers();

        // THEN
        assertEquals(2, result.size());
        assertEquals("Alice", result.get(0).getName());
        assertEquals("bob@test.com", result.get(1).getEmail());

        verify(userRepository).findAll();
    }

    @Test
    void shouldSaveUser() {

        // GIVEN
        User user = new User("Charlie", "charlie@test.com");

        when(userRepository.save(user)).thenReturn(user);

        // WHEN
        User saved = userService.saveUser(user);

        // THEN
        assertEquals("Charlie", saved.getName());
        assertEquals("charlie@test.com", saved.getEmail());

        verify(userRepository).save(user);
    }
}

