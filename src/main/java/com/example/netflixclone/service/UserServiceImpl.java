package com.example.netflixclone.service;

import com.example.netflixclone.dto.RegisterDTO;
import com.example.netflixclone.entity.User;
import java.util.List;

public interface UserServiceImpl {
    List<User> getAllUsers();
    User getUserById(Long id);
    String createUser(RegisterDTO registerDTO);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
}
