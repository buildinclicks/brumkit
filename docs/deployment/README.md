# Deployment Documentation

Complete documentation for deploying BrumKit to production on Vercel or via Docker.

---

## 📚 Available Guides

### 1. [Vercel Deployment Guide](./vercel-deployment-guide.md) 📖

**Complete, detailed deployment guide**

Covers everything step-by-step:

- Prerequisites and account setup
- Database configuration (Neon)
- Redis setup (Upstash)
- Email service (Resend)
- Environment variables
- Deployment process
- Verification steps
- Cron job setup
- Domain configuration
- Monitoring and logging
- Troubleshooting

**Use this for:** First-time deployment or comprehensive reference

**Time:** 30-45 minutes (including setup)

---

### 2. [Quick Reference](./quick-reference.md) ⚡

**Fast deployment reference**

Quick copy-paste guide for experienced users:

- Service links
- Environment variable template
- Common commands
- Quick troubleshooting

**Use this for:** Quick deployment if you already know the process

**Time:** 10-15 minutes (if services already set up)

---

### 3. [Deployment Checklist](./deployment-checklist.md) ✅

**Interactive deployment checklist**

Complete checklist covering:

- Pre-deployment preparation
- Service setup verification
- Environment variables
- Testing steps
- Post-deployment tasks
- Success criteria

**Use this for:** Ensuring nothing is missed during deployment

**Time:** Use alongside other guides

---

## 🚀 Deployment Overview

### Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Users (Browser)                    │
│                                                 │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│         Vercel (Next.js App)                   │
│         - Edge Network (CDN)                   │
│         - Serverless Functions                 │
│         - Automatic SSL                        │
│         - Cron Jobs                           │
│                                                 │
└─────┬──────────┬──────────┬───────────────────┘
      │          │          │
      ▼          ▼          ▼
   ┌──────┐  ┌──────┐  ┌────────┐
   │ Neon │  │Upstash│  │ Resend │
   │ (DB) │  │(Redis)│  │(Email) │
   └──────┘  └──────┘  └────────┘
```

### Services

| Service     | Purpose               | Plan  | Cost |
| ----------- | --------------------- | ----- | ---- |
| **Vercel**  | Hosting, deployment   | Hobby | Free |
| **Neon**    | PostgreSQL database   | Free  | $0   |
| **Upstash** | Redis (rate limiting) | Free  | $0   |
| **Resend**  | Email service         | Free  | $0   |
| **GitHub**  | Git hosting, CI/CD    | Free  | $0   |

**Total Monthly Cost:** $0 (Free tier sufficient for MVP)

---

## 🎯 Quick Start

### For First-Time Deployers

1. **Read Prerequisites**
   - [Vercel Deployment Guide - Prerequisites](./vercel-deployment-guide.md#prerequisites)

2. **Follow Full Guide**
   - [Vercel Deployment Guide](./vercel-deployment-guide.md)
   - Use [Deployment Checklist](./deployment-checklist.md) alongside

3. **Verify Deployment**
   - Check all items in verification section
   - Test all features

**Estimated Time:** 45-60 minutes

### For Experienced Deployers

1. **Quick Reference**
   - [Quick Reference Guide](./quick-reference.md)

2. **Checklist**
   - [Deployment Checklist](./deployment-checklist.md)

**Estimated Time:** 15-30 minutes

---

## 🔑 Key Concepts

### Environment-Based Configuration

The application automatically detects the environment:

**Development (Local):**

- Uses local Docker services (Redis, Mailhog)
- No external API dependencies
- Fast iteration

**Production (Vercel):**

- Uses cloud services (Upstash, Resend)
- Automatic SSL and CDN
- Global edge network

**No code changes needed!** Environment auto-detected via `NODE_ENV`.

### Serverless Architecture

**Benefits:**

- ✅ Auto-scaling (handles traffic spikes)
- ✅ Pay per use (free tier very generous)
- ✅ Zero maintenance
- ✅ Global edge network
- ✅ Automatic SSL certificates

**Considerations:**

- Cold starts (first request after idle)
- Connection pooling for database
- Stateless functions (use Redis for state)

### Cron Jobs

Daily scheduled task at 2 AM UTC:

- Permanently deletes soft-deleted accounts after 30 days
- Sends admin summary email
- Configured via `vercel.json`
- Secured with `CRON_SECRET`

---

## 📊 Free Tier Limits

### Vercel (Hobby)

- **Deployments:** Unlimited
- **Bandwidth:** 100 GB/month
- **Build Minutes:** 100 hours/month
- **Serverless Functions:** 100 GB-hours
- **Edge Network:** Included
- **SSL Certificates:** Automatic
- **Cron Jobs:** 1 job

**When to Upgrade:** >100k requests/month or need team features

### Neon (Free)

- **Storage:** 0.5 GB
- **Compute:** 1 shared vCPU
- **Branches:** 10 (dev databases)
- **Active Time:** Always available
- **Connections:** Connection pooling included

**When to Upgrade:** >0.5 GB storage or need dedicated compute

### Upstash (Free)

- **Daily Requests:** 10,000
- **Storage:** 256 MB
- **Max Record Size:** 1 MB
- **Regions:** 1
- **Eviction:** LRU (recommended)

**When to Upgrade:** >10k requests/day or need more storage

### Resend (Free)

- **Emails:** 100/day (3,000/month)
- **Domains:** 1 verified domain
- **API Keys:** Unlimited
- **Webhooks:** Included

**When to Upgrade:** >100 emails/day or need higher limits

---

## 🔒 Security Considerations

### Secrets Management

- ✅ All secrets stored in Vercel environment variables
- ✅ Never commit secrets to git
- ✅ Use 32+ character random strings for tokens
- ✅ Rotate secrets periodically

### Database Security

- ✅ SSL/TLS required (`?sslmode=require`)
- ✅ Strong passwords (auto-generated by Neon)
- ✅ Connection string never exposed to client
- ✅ Prisma parameterized queries (SQL injection prevention)

### API Security

- ✅ Rate limiting (Redis-based)
- ✅ CSRF protection (NextAuth)
- ✅ CORS configured
- ✅ Cron endpoints secured with Bearer token

### Email Security

- ✅ SPF, DKIM, DMARC records
- ✅ Domain verification required
- ✅ API key never exposed to client

---

## 📈 Monitoring

### What to Monitor

**Application:**

- Response times
- Error rates
- Deployment success/failure
- Function invocations

**Database:**

- Connection count
- Query performance
- Storage usage
- Active time

**Redis:**

- Hit rate
- Memory usage
- Commands per second
- Evictions

**Email:**

- Delivery rate
- Bounce rate
- Spam complaints

### Monitoring Tools

**Built-in (Free):**

- Vercel Analytics
- Vercel Logs
- Neon Monitoring
- Upstash Metrics
- Resend Dashboard

**External (Optional):**

- Sentry (error tracking)
- Better Uptime (uptime monitoring)
- LogRocket (session replay)

---

## 🚨 Common Pitfalls

### 1. Wrong Root Directory

**Problem:** Build fails with "Cannot find package.json"
**Solution:** Set root directory to `apps/web` in Vercel settings

### 2. Missing Environment Variables

**Problem:** Runtime errors, "X is not defined"
**Solution:** Add all required env vars in Vercel dashboard

### 3. Database Migrations Not Applied

**Problem:** Prisma schema mismatch errors
**Solution:** Run `prisma migrate deploy` before first deployment

### 4. Unverified Email Domain

**Problem:** Emails not sending, Resend validation errors
**Solution:** Verify domain in Resend, add all DNS records

### 5. Cold Start Latency

**Problem:** First request after idle is slow
**Solution:** Normal for serverless, consider Vercel Pro for faster cold starts

---

## 🎓 Learning Resources

### Official Documentation

- [Vercel Platform](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [Upstash Redis](https://docs.upstash.com/redis)
- [Resend Guide](https://resend.com/docs)

### Video Tutorials

- [Deploy Next.js to Vercel](https://www.youtube.com/watch?v=2HBIzEx6IZA)
- [Neon Setup Guide](https://www.youtube.com/c/NeonTech)
- [Vercel Cron Jobs](https://www.youtube.com/watch?v=h1Y-lJnZDT8)

### Community

- [Vercel Discord](https://vercel.com/discord)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)
- [Prisma Discord](https://pris.ly/discord)

---

## 🤝 Support

### Documentation Issues

- Found an error in the docs? Open an issue!
- Have suggestions? Submit a PR!

### Deployment Help

1. Check [Troubleshooting](./vercel-deployment-guide.md#troubleshooting) section
2. Search Vercel docs
3. Check service status pages
4. Contact support:
   - Vercel: https://vercel.com/help
   - Neon: https://neon.tech/docs/introduction/support
   - Upstash: https://docs.upstash.com
   - Resend: https://resend.com/support

---

## 📝 Changelog

**v1.0.0** (2026-01-15)

- Initial deployment documentation
- Complete Vercel deployment guide
- Quick reference guide
- Deployment checklist
- Neon, Upstash, Resend setup
- Cron job documentation
- Security best practices
- Monitoring guidelines

---

## 🎉 Ready to Deploy?

Choose your path:

1. **New to Deployment?**
   → Start with [Vercel Deployment Guide](./vercel-deployment-guide.md)

2. **Need Quick Reference?**
   → Use [Quick Reference](./quick-reference.md)

3. **Want a Checklist?**
   → Follow [Deployment Checklist](./deployment-checklist.md)

**Good luck with your deployment!** 🚀

If you run into issues, the troubleshooting sections have you covered. You've got this! 💪
