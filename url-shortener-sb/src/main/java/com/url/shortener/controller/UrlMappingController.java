package com.url.shortener.controller;


import com.url.shortener.Service.UrlMappingService;
import com.url.shortener.Service.UserService;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.model.User;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@CrossOrigin(origins = "*") // or specific origin like http://localhost:5500
@RestController
@RequestMapping("/api/urls")
@AllArgsConstructor
public class UrlMappingController {

    private UrlMappingService urlMappingService;
    private UserService userService;

    @PostMapping("/shorten")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UrlMappingDTO> createShortUrl(@RequestBody Map<String,String> request ,
                                                        Principal principal){

        String originalUrl = request.get("OriginalUrl");
        User user=  userService.findByUsername(principal.getName());
        UrlMappingDTO urlmappingDTO = urlMappingService.createShortUrl(originalUrl,user);
        return ResponseEntity.ok(urlmappingDTO);


    }

    @GetMapping("/myurls")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UrlMappingDTO>> getUserUrls(Principal principal){
        User user = userService.findByUsername(principal.getName());
        List<UrlMappingDTO> urls = urlMappingService.getUrlsByUser(user);
        return ResponseEntity.ok(urls);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteUrl(@PathVariable Long id, Principal principal){
        User user = userService.findByUsername(principal.getName());
        urlMappingService.deleteUrl(id, user);
        return ResponseEntity.noContent().build();
    }

}
