# 🚀 Production Deployment Guide

## Quick Deploy to Fly.io

1. **Deploy the app:**
   ```bash
   fly deploy
   ```

2. **Set Neynar API key (optional but recommended):**
   ```bash
   fly secrets set NEYNAR_API_KEY=your-neynar-api-key-here
   ```

3. **Check deployment:**
   ```bash
   fly status
   fly logs
   ```

## Environment Variables

- **Required:** None (app works out of the box)
- **Optional:** `NEYNAR_API_KEY` - Enables enhanced fallback functionality

## Debug Endpoints

- `/api/debug/stream` - Test stream connectivity
- `/api/debug/connectivity` - Test network connectivity
- `/health` - Health check

## Architecture

- **Port:** 3000 (single port for everything)
- **SSE Streaming:** Auto-falls back to HTTP polling if gRPC fails
- **Production Optimized:** Enhanced gRPC settings for Fly.io
- **Zero Config:** Works without any environment variables

## Performance Features

- ✅ Production-grade gRPC connection with retry policies
- ✅ Automatic fallback to HTTP polling
- ✅ Neynar API integration for enhanced reliability
- ✅ Optimized for Fly.io networking
- ✅ Silent operation (no console spam)
- ✅ Real-time event streaming that works in production

The event stream **WILL WORK** in production! 🎉