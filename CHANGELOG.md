# HiPat Changelog

All notable changes to the HiPat project will be documented in this file.

## [Unreleased]
### Changed
- Updated color scheme to match HiPat branding (#1a7cf7 and #b45cff)
- Enhanced contrast with pure black background and white text
- Improved avatar glow effects with brand colors
- Refined suggestion chips with white background and brand accents
- Updated input and caption bar styling for better visibility
- Increased margin below PatAvatar to 48px/32px (desktop/mobile)
- Updated suggestion bubbles with improved stacking on mobile
- Made chat input bar truly fixed to viewport bottom
- Added rolling caption bar above input
- Refined brand colors (#1a7cf7 and #b45cff)
- Adjusted avatar size (140px desktop, 112px mobile)
- Enhanced responsive spacing and layout
- Updated chat layout with pure black background
- Refined suggestion chips with white background and glowing borders
- Added fixed caption bar above chat input
- Improved vertical spacing and component positioning
- Enhanced chat input styling with translucent background
- Adjusted avatar position to 20% viewport height
- Redesigned chat layout with centered avatar and sticky input
- Updated suggestion chips with glowing blue borders
- Added caption bar for real-time response feedback
- Improved avatar positioning and animations
- Implemented new black/blue/purple color scheme
- Enhanced visual hierarchy and spacing
- Added sticky chat input with mode toggle
- Renamed dark color palette to hipatDark for better theme configuration
- Updated UI with new HiPat branding colors and design
- Increased Pat avatar size and added floating animation
- Added accessibility controls for voice and contrast
- Implemented new color scheme with pure black background
- Added silent mode and high contrast toggles
- Improved avatar animations and visual feedback
- Adjusted layout for better vertical spacing

## [0.1.0] - 2025-04-24
### Added
- Project initialized with PRD v1.0 as per HiPat NLWeb MVP spec
- Core authentication flow with email/password
- Basic chat interface with message history
- Admin panel for agent management
- Feedback system with ratings and categories
- Profile and Settings page placeholders
- Supabase integration with RLS policies
- Agent routing system with Manager agent
- XState-based chat machine for state management
- Basic agent swarm architecture
- Silent mode database structure

### Technical Infrastructure
- React + Vite setup with TypeScript
- Tailwind CSS for styling
- Supabase for backend and auth
- XState for complex state management
- Zustand for global state
- Edge Functions structure (pending implementation)

### Database Schema
- User profiles with RLS
- Agent definitions and capabilities
- Message history
- Feedback system
- User settings
- Tool registry
- Agent-tool relationships
- Swarm coordination

### Known Issues
- OpenAI integration pending
- Edge Functions not implemented
- Silent mode UI missing
- Dashboard needs implementation
- Real-time updates pending
- Testing infrastructure needed