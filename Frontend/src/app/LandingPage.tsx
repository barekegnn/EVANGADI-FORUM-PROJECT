"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  MessageCircle,
  TrendingUp,
  Bell,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "Ask Anything",
      description:
        "Get peer-verified answers from seniors and experienced students about departments, courses, campus life, and more.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Find the Right People",
      description:
        "Tag questions by department or topic to reach the right mentors faster.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Best Answers Rise",
      description:
        "Vote and accept answers so the most helpful guidance reaches the top.",
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: "Stay Updated",
      description:
        "Get notified when your questions receive answers or updates.",
    },
  ];

  const benefits = [
    {
      title: "For Freshers",
      description:
        "Fast, reliable guidance to navigate your first year at Haramaya University.",
    },
    {
      title: "For Seniors/Mentors",
      description: "Pay it forward and build community by helping newcomers.",
    },
    {
      title: "For Clubs/Communities",
      description:
        "Share accurate, centralized information with the student body.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            HU Connect
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Bridge the Knowledge Gap at Haramaya University
          </p>
          <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto mb-12">
            Helping first-year students quickly find trustworthy answers to
            university life. Get guidance directly from experienced students
            who've been there.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/register">
                Join HU Connect <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Problem We Solve
            </h2>
            <p className="text-lg text-muted-foreground">
              Freshers at Haramaya University face common challenges that impact
              their academic journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  Feeling Lost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Information is scattered, unclear, or outdated, making it
                  difficult to find reliable guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  Finding Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Not everyone knows who to ask, leading to wasted time and
                  potentially wrong advice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  Generic AI Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tools like ChatGPT lack the lived context of Haramaya's
                  realities and can't provide campus-aware guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Solution
            </h2>
            <p className="text-lg text-muted-foreground">
              HU Connect provides a platform where students can connect, share
              knowledge, and grow together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-primary/20 h-full">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Who It's For
            </h2>
            <p className="text-lg text-muted-foreground">
              HU Connect serves the entire Haramaya University community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Our Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Creating a more supportive campus environment for everyone
          </p>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-2xl font-bold text-primary mb-2">
                Faster Onboarding
              </h3>
              <p className="text-muted-foreground">
                New students get up to speed quickly with reliable information
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-2xl font-bold text-primary mb-2">
                Fewer Mistakes
              </h3>
              <p className="text-muted-foreground">
                Peer-verified guidance reduces costly errors and confusion
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-2xl font-bold text-primary mb-2">
                Stronger Community
              </h3>
              <p className="text-muted-foreground">
                Build connections and foster a culture of knowledge sharing
              </p>
            </div>
          </div>

          <div className="mt-16">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/register">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
