package com.example.mymusicopinion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.example.mymusicopinion.models")
public class MymusicopinionApplication {

	public static void main(String[] args) {
		SpringApplication.run(MymusicopinionApplication.class, args);
	}
}
