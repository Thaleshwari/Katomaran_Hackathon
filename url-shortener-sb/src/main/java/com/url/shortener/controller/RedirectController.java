package com.url.shortener.controller;

import com.url.shortener.model.UrlMapping;
import com.url.shortener.Repository.UrlMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RedirectController {

    @Autowired
    private UrlMappingRepository urlMappingRepository;

    @Transactional
    @GetMapping("/s/{shortUrl}")
    public ResponseEntity<Void> redirectToOriginalUrl(@PathVariable String shortUrl) {
        if (shortUrl == null || shortUrl.isEmpty() || shortUrl.equals("error")) {
            return ResponseEntity.notFound().build();
        }

        try {
            UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
            if (urlMapping != null) {
                String originalUrl = urlMapping.getOriginalUrl();
                if (originalUrl != null && !originalUrl.isEmpty()) {
                    urlMapping.setClickCount(urlMapping.getClickCount() + 1);
                    urlMappingRepository.save(urlMapping);
                    
                    if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
                        originalUrl = "http://" + originalUrl;
                    }
                    
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .header(HttpHeaders.LOCATION, originalUrl)
                            .build();
                }
            }
        } catch (Exception e) {
            System.err.println("Redirection error for " + shortUrl + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
        return ResponseEntity.notFound().build();
    }
}
