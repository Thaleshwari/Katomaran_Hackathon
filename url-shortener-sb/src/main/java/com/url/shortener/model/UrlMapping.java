package com.url.shortener.model;
import java.util.*;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.web.bind.annotation.Mapping;

import java.time.LocalDateTime;
@Entity
@Data

public class UrlMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String originalUrl;
    private String shortUrl;
    private int clickCount=0;
    private LocalDateTime createdDate;


    @ManyToOne
    @JoinColumn(name = "user_Id")
    private User user;

    @OneToMany(mappedBy = "urlMapping")
    private List<ClickEvent> clickEvents;

}
