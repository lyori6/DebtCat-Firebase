---
layout: post
title: "FindMePet: Using AI to Solve the Pet Adoption Mismatch Problem"
author: Lyor Itzhaki
date: 2025-03-01
tags: [product management, startups, user experience]
description: A case study of building an AI-powered pet adoption platform that connects more animals with loving homes.
image: /assets/images/shasta_main.png
---


*A product case study of building an AI-powered pet adoption platform that connects more animals with loving homes*

![Landing page featuring Shasta, the inspiration behind FindMePet](/assets/images/shasta_main.png)
*Pictured: The FindMePet landing page featuring Shasta, Lyor's adopted dog and inspiration for the project*

## The Problem: Pet Adoption is Broken

Let's talk about a problem that doesn't get enough attention: pet adoption is fundamentally broken.

Between 10-20% of adopted pets are returned to shelters, often due to mismatched expectations and behavioral issues. A University of Alberta study found that 80% of adopters choose pets based primarily on looks rather than compatibility. Meanwhile, 34% of pet owners buy from breeders instead of adopting, and 47% wrongly believe shelters only have older or poorly trained animals.

These aren't just statistics—they represent real animals who briefly experienced the joy of a home before being returned to a shelter cage.

This is exactly the problem that product manager and animal lover Lyor set out to solve with FindMePet.

## The Vision: Match-Making for Humans and Pets

"I adopted my dog Shasta and saw firsthand how challenging the process can be," says Lyor, who has spent nearly six years as a product manager across various SaaS companies. "I wanted to create a tool that helps more pets find forever homes by matching them with the right owners from the start."

FindMePet is a Next.js application that combines the PetFinder API with OpenAI to revolutionize how people discover adoptable pets. The core innovation is using AI to provide personalized recommendations based on user preferences and lifestyle compatibility.

"Think of it as match-making, but between humans and pets," explains Lyor. "I'm trying to reduce the return rate by creating better matches from the beginning."

## Building the Product: Hard Choices and Fast Execution

As an experienced PM, Lyor knew that shipping a focused MVP quickly was more important than building the perfect product. This meant making some hard trade-offs:

1. **Limited Animal Selection**: While the PetFinder API offers data on everything from dogs and cats to horses and chinchillas, FindMePet launched with just dogs, cats, and rabbits to focus the experience.

2. **Streamlined Filtering**: Lyor implemented filtering upfront in the API call rather than allowing users to filter results after the search to simplify the initial experience.

3. **Prioritizing Visual Appeal**: Animals without photos are de-prioritized in results, recognizing that visuals drive emotional connection in adoption decisions.

4. **Quick Search vs. Guided Flow**: The product includes a "Quick Search" feature for users who want to browse directly, while maintaining the guided questionnaire for those who want personalized recommendations.

![Results page showing AI-powered recommendation](/assets/images/results_page.png)
*The results page highlights an AI-recommended pet with compatibility metrics*

## The Tech Stack: Next.js + AI-Powered Development

FindMePet is built on Next.js 14 with App Router, with styling via TailwindCSS and deployment on Vercel. The application integrates two key APIs:

1. **PetFinder API**: Provides real-time data on adoptable pets across the United States

2. **OpenAI (GPT-4o-mini)**: Powers the personalized recommendation engine

Lyor encountered several technical challenges, particularly around API integration:

- **PetFinder Authentication**: Required implementing OAuth 2.0 via a Cloudflare Worker proxy
- **OpenAI Response Parsing**: Needed careful prompt engineering to generate structured, parseable recommendations
- **Performance Optimization**: Implemented caching to reduce API calls and improve user experience

"One of the more interesting challenges was finding the right balance with the AI prompts," notes Lyor. "I needed to provide enough context to get relevant recommendations while ensuring consistent, structured responses I could parse reliably."

## Building Solo with AI Tools

What makes this case study particularly interesting is how Lyor built the entire application himself using AI-powered development tools:

1. **v0**: Used for initial prototyping and generating layouts based on wireframes
2. **Cursor & Windsurf**: AI-powered IDEs that assisted with coding and refactoring
3. **Claude**: Started with Anthropic's Claude 3.5 Sonnet and later upgraded to Claude 3.7, which helped write cleaner code

"As a PM who's not a developer by training, these AI tools were incredibly empowering," says Lyor. "They allowed me to be a builder in the digital world, not just someone who writes specs for others to implement."

Lyor observed an important pattern in AI-assisted development: "Getting to 70% completion was surprisingly easy with tools like v0. But that last 20-30%—perfecting layouts, adding advanced features, and debugging edge cases—follows the Pareto principle, taking about 80% of the total development time. I'm hoping future AI tools with better reasoning capabilities and larger context windows will make that final stretch easier."

One crucial tip Lyor discovered: "Always have your AI document what it's doing and create its own documentation. This serves two purposes: it helps you understand what went wrong when the AI makes mistakes, and it prevents you from exhausting your context window when debugging, since you can refer to specific documentation instead of repeating the entire conversation."

![Pet details page showing comprehensive information](/assets/images/pet_details.png)
*The pet details page provides comprehensive information to help users make informed decisions*

## The User Experience: Simple, Delightful, and Effective

The FindMePet experience is designed to be simple yet emotionally engaging:

1. **Homepage**: Features a rotating hero component showcasing adoptable pets with minimal text

2. **Questionnaire Flow**: Collects location and pet type preferences through a simple, guided process

3. **Results**: Displays available pets in a visually-appealing grid with one AI-recommended pet highlighted

4. **Pet Details**: Provides comprehensive information on each pet with adoption instructions

5. **Quick Search**: Allows returning users to bypass the questionnaire and get directly to browsing

"I deliberately kept the flow simple for the first version," explains Lyor. "Future iterations will collect more detailed user preferences to further improve the AI recommendations, but I wanted to start with something clean and easy to use."

## Roadmap: Just Getting Started

FindMePet is just beginning its journey, with several key enhancements planned:

1. **Enhanced User Input**: Collecting more detailed lifestyle preferences to improve recommendations

2. **Multiple Recommendations**: Providing primary, secondary, and tertiary options with comparisons

3. **Performance Metrics**: Implementing analytics to track adoption funnel metrics

4. **User Research**: Conducting studies to understand user needs and refinement opportunities

5. **Success Tracking**: Adding follow-up forms to learn how many users actually adopt pets through the platform

"My north star metric will ultimately be successful adoptions—pets who find permanent homes through the platform," says Lyor. "In the short term, I'm tracking engagement metrics like clicks on the 'Adopt' button to measure interest."

## Lessons for Product Managers

Lyor's experience building FindMePet offers several valuable lessons for product managers:

1. **Leverage AI Strategically**: AI can both enhance your development process and deliver unique user value

2. **Make Hard Trade-offs**: Focused constraints (like limiting to three animal types) enabled faster delivery

3. **Start with Core Value**: Prioritize the primary user need (finding compatible pets) before adding nice-to-have features

4. **Personal Passion Drives Product Quality**: Lyor's love for animals created an authentic foundation for the product

5. **Tools Enable Builders**: Modern AI tools are enabling PMs to directly build products without deep technical expertise

6. **Document the AI's Work**: Having AI document its own code and reasoning saves time and provides crucial context for debugging

"The most surprising thing was how quickly I was able to go from concept to functional application," reflects Lyor. "With the right tools and focused scope, I built something genuinely useful in a fraction of the time it would have taken traditionally."

## Try It Yourself

FindMePet is live at [findme.pet](https://findme.pet) and the code is available on GitHub. Whether you're looking to adopt a pet or just curious about how AI can transform traditional processes, it's worth checking out.

---

*This case study was prepared in March 2025 based on the FindMePet project developed by Lyor.*
