import { z } from 'zod';

// User Query Schema - matches n8n form fields
export const UserQuerySchema = z.object({
    destination: z.string().optional(),      // "Where to?" field
    dates: z.string().optional(),            // "When?" field
    activity1: z.string().optional(),        // "Activity 1" field
    activity2: z.string().optional(),        // "Activity 2" field
    activity3: z.string().optional(),        // "Activity 3" field
    dealmaker: z.string().optional(),        // "Dealmaker" field
});

// Routing Result Schema - classification output
export const RoutingResultSchema = z.object({
    routing: z.enum(['Details', 'Options_Destinations', 'Options_Activities', 'Options_Both', 'Unknown']),
    extracted: z.object({
        activity: z.string().nullable(),
        destination: z.string().nullable(),
        date: z.string().nullable(),
        deal_maker: z.string().nullable(),
    }),
});

// Experience Card Schema - agent output
export const ExperienceCardSchema = z.object({
    card_title: z.string(),
    experience_description: z.string(),
    practical_logistics: z.string(),
});

// Option Item Schema - for destinations/activities
export const OptionItemSchema = z.object({
    name: z.string(),
    subtext: z.string(),
    ranking: z.number().min(0).max(5),
    justification: z.string(),
    image_query: z.string(),
});

// Destination with Activities Schema - for /both endpoint
export const DestinationWithActivitiesSchema = z.object({
    name: z.string(),
    region: z.string(),
    ranking: z.number().min(0).max(5),
    justification: z.string(),
    image_query: z.string(),
    activities: z.array(z.object({
        name: z.string(),
        justification: z.string(),
    })).length(2),
});

// Inferred Types
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type RoutingResult = z.infer<typeof RoutingResultSchema>;
export type ExperienceCard = z.infer<typeof ExperienceCardSchema>;
export type OptionItem = z.infer<typeof OptionItemSchema>;
export type DestinationWithActivities = z.infer<typeof DestinationWithActivitiesSchema>;
