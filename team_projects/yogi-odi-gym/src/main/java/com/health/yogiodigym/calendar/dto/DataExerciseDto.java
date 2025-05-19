package com.health.yogiodigym.calendar.dto;


import lombok.*;


@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DataExerciseDto {

        private Long id;
        private String name;
        private Float energyConsumption;
}
