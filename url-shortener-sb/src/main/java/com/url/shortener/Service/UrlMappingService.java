package com.url.shortener.Service;


import com.url.shortener.Repository.UrlMappingRepository;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.model.UrlMapping;
import com.url.shortener.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class UrlMappingService {

     @Autowired
    private UrlMappingRepository urlMappingRepository;

    public UrlMappingDTO createShortUrl(String originalUrl, User user){
        String shortUrl = generateShortUrl();
        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(originalUrl);
        urlMapping.setShortUrl(shortUrl);
        urlMapping.setUser(user);
        urlMapping.setCreatedDate(LocalDateTime.now());
        UrlMapping savedUrlMapping = urlMappingRepository.save(urlMapping);

        return convertToDto(savedUrlMapping);
    }

    public List<UrlMappingDTO> getUrlsByUser(User user) {
        return urlMappingRepository.findByUser(user)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public void deleteUrl(Long id, User user) {
        UrlMapping urlMapping = urlMappingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("URL not found"));
        if (!urlMapping.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this URL");
        }
        urlMappingRepository.delete(urlMapping);
    }

    private UrlMappingDTO convertToDto(UrlMapping urlMapping){
        UrlMappingDTO urlMappingDTO = new UrlMappingDTO();

        urlMappingDTO.setId(urlMapping.getId());
        urlMappingDTO.setOriginalUrl(urlMapping.getOriginalUrl());
        urlMappingDTO.setShortUrl(urlMapping.getShortUrl());
        urlMappingDTO.setClickCount(urlMapping.getClickCount());
        urlMappingDTO.setUsername(urlMapping.getUser().getUsername());
        urlMappingDTO.setCreatedDate(urlMapping.getCreatedDate());  // add this

        return urlMappingDTO;
    }

    private String generateShortUrl() {
        String character="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder shortUrl= new StringBuilder();
        for(int i=0;i<8;i++){
            shortUrl.append(character.charAt(random.nextInt(character.length())));
        }
        return shortUrl.toString();
    }
}
