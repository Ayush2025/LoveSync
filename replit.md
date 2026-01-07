# LoveSync - AI Companion Platform

## Overview
LoveSync is an advanced AI-powered companion platform designed to create genuine emotional connections through realistic AI personalities. It features sophisticated authentication, persistent memory systems, and human-like AI behaviors, aiming to provide an authentic and personal user experience. The project is built with modern web technologies, focusing on optimal performance and user engagement. Its vision is to offer a unique platform for meaningful AI interactions, leveraging advanced AI to simulate realistic relationships.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
### Multi-Language and Audio Call Implementation
- **Language Support**: Added comprehensive language context system supporting English, Hindi, and Hinglish
- **Audio Call Interface**: Implemented real-time audio call functionality with WebSocket support
- **Language-Aware AI**: Enhanced AI service to generate responses based on user's language preference
- **Database Schema**: Added preferred_language column to users table with Hinglish as default
- **UI Components**: Added LanguageSelector component and integrated across all interfaces
- **WebSocket Integration**: Added audio call WebSocket server on /ws path with audio processing capabilities

### Architecture Updates
- **Language Context**: Centralized language management with translation dictionaries
- **Audio Service**: Server-side audio processing with Groq AI integration for voice responses
- **Multi-language AI Prompts**: Language-specific prompts for natural Hindi/Hinglish responses
- **Real-time Communication**: WebSocket server for audio call management and real-time features

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with custom romantic/girlfriend-themed design tokens
- **State Management**: TanStack Query (server state), local state (UI)
- **Routing**: Wouter
- **Component Structure**: Modular and reusable UI components
- **UI/UX Decisions**: Responsive design (mobile-first), romantic theme (custom CSS variables, gradients), interactive elements (hover, transitions, animations), accessibility (ARIA labels, keyboard navigation). Visual enhancements include colored text for dialogue/actions and third-person narrative for immersive storytelling. Full-body character photos are used for all AI companions.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API pattern (`/api` prefix)
- **Development**: Hot module replacement, Vite integration
- **Error Handling**: Centralized middleware with structured responses

### Database & ORM
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM (type-safe schema definitions)
- **Migration**: Drizzle Kit
- **Connection**: Neon Database serverless driver
- **Schema Location**: Shared definitions in `/shared/schema.ts`

### Key Features & Implementations
- **AI Service Integration**: Uses Groq SDK for chat completions, supports user-provided and default API keys, manages in-memory conversation state, performs intent analysis for emotional and contextual responses, and generates dynamic personalities based on girlfriend profiles. Includes an auto-message system for spontaneous AI messages and a comprehensive roleplay adventures system with progression tracking.
- **Chat System**: Real-time messaging with typing indicators, supports user/AI messages with timestamps, offers quick responses (flirty suggestions), and manages local message persistence.
- **Girlfriend Profiles**: Features multiple pre-defined personalities with unique traits, image-based avatars, and a memory system for personalized interactions. Character images are locally stored and assigned uniquely across different character types (AI girlfriends, roleplay characters, random encounters).
- **Authentication System**: Full user authentication with secure login/signup, session-based management, protected API routes, and persistent user sessions. AI companions use the user's real name.
- **Persistent Chat Memory**: Full database persistence for conversations and messages, allowing history retention across sessions for each girlfriend.
- **Realistic AI Personality System**: Dynamic personality states, human-like behaviors (moods, boundaries, opinions), context-aware responses, and distinct career/hobby focuses for each girlfriend.
- **Roleplay Progression System**: Multi-level progression based on message count and quality, dynamic behavior adaptation, character-specific context awareness, and advanced anti-repetition. Includes both challenging and accommodating character types with varying progression speeds.
- **Response Detail System**: AI responses are optimized for length (2-3 sentences) and detail, incorporating actions, expressions, sensory details, and emotional descriptions.

### Key Architectural Decisions
- **Monorepo Structure**: Client, server, and shared code in a single repository.
- **TypeScript First**: Full TypeScript implementation for type safety.
- **Component Library**: shadcn/ui for consistent and accessible UI components.
- **Database Strategy**: Drizzle ORM with PostgreSQL for persistent chat memory.
- **AI Integration**: Groq selected for fast, cost-effective AI responses and realistic personality systems.
- **State Management**: TanStack Query for server state; local state for UI management.
- **Styling Approach**: Tailwind CSS with a custom design system for a romantic theme.
- **Development Experience**: Vite for fast builds and excellent developer experience.

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **UI Framework**: Radix UI
- **Styling**: Tailwind CSS, class-variance-authority
- **State Management**: TanStack React Query
- **AI Integration**: Groq SDK
- **Database**: Drizzle ORM, Neon Database serverless driver

### Development Tools
- **Build System**: Vite (with React plugin and TypeScript support)
- **Code Quality**: TypeScript (strict mode), ESLint
- **Development Server**: Express.js (with Vite middleware integration)
- **Database Tools**: Drizzle Kit

### Other Integrations
- **Image Handling**: Local image imports are used for all character photos, removing external dependencies on services like Unsplash or Pixabay.