# AI Voice Assistant Implementation Context

## Project Overview
We are implementing an AI-powered voice assistant for an existing admin panel that manages solar panel leads and marketing campaigns. The assistant will use OpenAI Whisper for speech-to-text, ChatGPT for intelligence, and ElevenLabs for text-to-speech.

## Existing System Architecture

### Current Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL/MySQL
- **UI Components**: Lucide React icons, custom modal system
- **Features**: Lead management CRM, analytics dashboard, page builder, tracking setup

### Database Schema (Existing)
- Leads table with 15+ fields including:
  - Personal info (name, email, phone, postcode)
  - Solar system details (panel count, system size, battery)
  - Marketing data (source, medium, campaign)
  - Status tracking (new → contacted → qualified → quoted → won/lost)
  - Priority scoring (low/medium/high)
  - Timestamps and metadata

### Current Features
1. **CRM System**: Full lead lifecycle management
2. **Analytics Dashboard**: Real-time metrics and KPIs
3. **Search System**: Cmd+K keyboard shortcut overlay
4. **API Infrastructure**: RESTful endpoints at /api/*
5. **Real-time Updates**: WebSocket-ready architecture
6. **Modal System**: Reusable modal components

## AI Assistant Requirements

### Core Capabilities
1. **Voice Interaction**
   - Voice commands via Whisper API
   - Natural language processing with ChatGPT
   - Voice responses via ElevenLabs
   - Push-to-talk or wake word activation

2. **Data Analysis & Visualization**
   - Generate charts/graphs from database queries
   - Create custom dashboards on demand
   - Provide insights and recommendations
   - Predictive analytics and forecasting

3. **Admin Panel Management**
   - Navigate between sections via voice
   - Create/update/delete records
   - Generate reports
   - Monitor system health
   - Automate routine tasks

### Specific Use Cases

#### Lead Management
- "Show me all high-priority leads from Google Ads"
- "Create a graph of lead conversion rates this month"
- "Which leads haven't been contacted in 48 hours?"
- "Update lead status to qualified"

#### Analytics & Reporting
- "Generate a campaign performance dashboard"
- "Compare this week's metrics to last week"
- "What's our ROI on Facebook ads?"
- "Predict next month's lead volume"

#### System Maintenance
- "Check for duplicate leads"
- "Archive completed leads older than 6 months"
- "Run system health check"
- "Optimize database queries"

## Technical Implementation Details

### API Integrations Required
1. **OpenAI Whisper API**
   - Model: whisper-1
   - Audio formats: webm, mp3, wav
   - Cost: ~$0.006/minute

2. **OpenAI ChatGPT API**
   - Model: gpt-4 or gpt-3.5-turbo
   - Function calling for structured commands
   - Context window management

3. **ElevenLabs API**
   - Voice selection and cloning
   - Streaming audio response
   - Cost: ~$0.30/1000 characters

### Frontend Components Needed
1. **VoiceAssistant.tsx**: Main assistant interface
2. **AudioRecorder.tsx**: Microphone capture
3. **AudioVisualizer.tsx**: Voice activity visualization
4. **ChatInterface.tsx**: Text fallback and history
5. **DashboardGenerator.tsx**: Dynamic chart creation

### Backend Services Required
1. **Voice Processing Service**: Handle audio streams
2. **Command Parser**: Natural language to structured commands
3. **Data Query Engine**: Dynamic database queries
4. **Chart Generation Service**: Data to visualization
5. **Response Synthesizer**: Generate voice responses

### Database Extensions
```sql
-- New tables needed
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id VARCHAR,
  timestamp TIMESTAMP,
  user_input TEXT,
  ai_response TEXT,
  action_taken JSON,
  context JSON
);

CREATE TABLE ai_generated_dashboards (
  id UUID PRIMARY KEY,
  name VARCHAR,
  configuration JSON,
  created_by VARCHAR,
  created_at TIMESTAMP
);

CREATE TABLE ai_scheduled_tasks (
  id UUID PRIMARY KEY,
  task_type VARCHAR,
  schedule CRON,
  parameters JSON,
  enabled BOOLEAN
);
```

## Implementation Priorities

### Phase 1 (MVP)
- Basic voice input/output
- Simple query commands ("show all leads")
- Text-based responses
- Integration with existing search system

### Phase 2 (Analytics)
- Chart generation from voice commands
- Dashboard creation
- Data insights and analysis
- Export capabilities

### Phase 3 (Automation)
- Scheduled reports
- Proactive notifications
- Bulk operations
- System optimization

### Phase 4 (Advanced)
- Multi-turn conversations
- Learning from user patterns
- Custom workflow automation
- Predictive actions

## Security Considerations
- API key management (environment variables)
- User permission validation
- Input sanitization
- Rate limiting
- Audit logging
- PII data protection

## Performance Requirements
- Voice recognition: <2 seconds
- Command execution: <3 seconds
- Dashboard generation: <5 seconds
- Concurrent users: 10+
- Audio streaming: Real-time

## User Experience Guidelines
- Accessible from any page via floating widget
- Visual feedback during processing
- Fallback to text input if voice fails
- Conversation history preservation
- Undo/confirm for destructive actions
- Mobile responsive

## Cost Optimization Strategies
- Cache frequent queries
- Use GPT-3.5 for simple tasks
- Batch similar requests
- Local processing where possible
- Implement usage quotas

## Testing Requirements
- Unit tests for command parsing
- Integration tests for API calls
- E2E tests for voice workflows
- Performance benchmarks
- Error handling scenarios

## Documentation Needs
- API endpoint documentation
- Voice command reference
- Dashboard template library
- Troubleshooting guide
- User onboarding flow

## Success Metrics
- Voice command accuracy >90%
- Response time <3 seconds
- User adoption rate >60%
- Task completion rate >80%
- Cost per interaction <$0.10