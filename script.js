// Use GSAP for all sequenced animations
function initAnimations() {
    // 1. Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Create a timeline for sequencing the initial load animations
    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power2.out" } });

    // --- INITIAL LOAD ANIMATION (Hero Section) ---
    // Runs only once on page load
    tl.to(".logo", { y: 0, opacity: 1, duration: 0.5, ease: "power2.inOut" }, 0.2)
    .to(".nav-item:not(.logo)", { y: 0, opacity: 1, stagger: 0.15, }, ">-0.2")
    .to(".hero-line", { opacity: 1, y: 0, duration: 0.8, stagger: 0.3, }, ">+0.1")
    .to(".hero-image-placeholder-gsap", { opacity: 1, x: 0, y: 0, duration: 1.0, ease: "power3.out" }, "<+0.2");

    // 🟢 NEW: PIN HERO SECTION AND FADE ON PROJECTS SCROLL OVER 🟢
gsap.to(".hero-section", {
    opacity: 0, // Hero section ko invisible karega
    scrollTrigger: {
        trigger: ".hero-section", // Animation Hero section ko dekhte hue trigger hoga
        start: "top 11%", // Hero page ko top par pin karega
        endTrigger: "#work", // 🟢 MODIFIED: Ab Projects section (#work) trigger karega
        end: "top 50%", // Hero section tab tak fade hoga jab Projects section ka top, viewport ke 25% par pahunch jaye
        pin: true, // Hero section ko screen par pin rakhega
        scrub: 2, // Scroll ke saath smooth synchronize hoga
    }
});
    // gsap.fromTo("#about",
    //     { opacity: 0, y: 50 },
    //     {
    //         opacity: 1,
    //         y: 0,
    //         duration: .5,
    //         ease: "power2.out",
    //         scrollTrigger: {
    //             trigger: "#about",
    //             start: "top 100%", // Jab #about ka top viewport ke 90% par ho
    //             end: "top 30%", // Jab #about ka top viewport ke 50% par ho, tab tak poora dikh jaye
    //             scrub: true, // Smooth scrolling ke saath sync
    //             toggleActions: "play none none reverse",
    //         }
    //     }
    // );
    gsap.to(".typewriter-subheading", {
        opacity: 1, // Target opacity 1 (fully visible)
        duration: 1.5, // Fade duration
        delay: 3, // 🟢 4 seconds delay after page load before starting fade
    });
    
    // 🟢 ANIMATION 1: Top Row (Cards 1, 2, 3) - Left Stacked (FASTER DURATION) 🟢
    gsap.to(".service-card:nth-child(-n+3)", {
        x: 0, 
        opacity: 1,
        duration: 0.35, // 🟢 MODIFIED: Thoda aur fast kiya for aggressive swipe effect
        ease: "power2.out",
        stagger: -0.1, // Right-to-Left sequence
        scrollTrigger: {
            trigger: "#services",
            start: "top 75%", 
            toggleActions: "play none none none",
            once: true, 
        }
    });

    // 🟢 ANIMATION 2: Bottom Row (Cards 4, 5, 6) - Right Stacked 🟢
    gsap.to(".service-card:nth-child(n+4)", {
        x: 0, 
        opacity: 1,
        duration: 0.4, // Duration ko 0.4s par rakha gaya
        ease: "power2.out",
        stagger: 0.1, // Left-to-Right sequence
        scrollTrigger: {
            trigger: ".service-card:nth-child(4)", // Card 4 ko trigger banaya
            start: "top bottom", // Animation tab shuru hoga jab Card 4 viewport mein dikhne lagega
            toggleActions: "play none none none",
            once: true, 
        }
    });

    
    // 🟢 PROJECTS SECTION INFINITE LOOP LOGIC 🟢
    function initProjectsLoop() {
        const track = document.getElementById('projects-track');
        // Select only original cards, clones will be added later
        const originalCards = Array.from(track.querySelectorAll('.project-card:not(.clone)'));
        
        if (originalCards.length === 0) return;

        // Clone cards to create a seamless loop
        const cardCount = originalCards.length;
        // Cards ko do baar clone karte hain taaki continuous loop smooth ho
        for (let i = 0; i < cardCount; i++) {
            const clone = originalCards[i].cloneNode(true);
            clone.classList.add('clone');
            track.appendChild(clone);
        }

        // Card ki dimensions (CSS se match honi chahiye)
        const CARD_WIDTH = 450; 
        const MARGIN = 40; // 20px left + 20px right
        
        // Calculate the distance to move (width of the original set of cards + margins)
        const singleSetMoveDistance = cardCount * CARD_WIDTH + (cardCount * MARGIN);
        
        // Set the track width (should be twice the single set width for a smooth loop)
        gsap.set(track, { width: singleSetMoveDistance * 2 }); 


        // 🟢 MODIFIED: Reduced duration to 18s (was 30s) to increase speed
        const LOOP_DURATION = 5; 
        
        // Define the infinite animation
        const loopTimeline = gsap.timeline({
            repeat: -1, // Loop forever
            paused: true, // Start paused, ScrollTrigger will resume
            defaults: { ease: "linear", duration: LOOP_DURATION } 
        });

        // Animate the track to the left by one full set of cards
        loopTimeline.fromTo(track, 
            { x: 0 }, 
            { x: -singleSetMoveDistance, ease: "linear", duration: LOOP_DURATION }
        );

        // Hover functionality to pause and resume the loop AND control video
        const projectsContainer = document.querySelector('.projects-container-wrapper');
        const projectCards = document.querySelectorAll('.project-card');

        // Loop pause/resume functionality
        projectsContainer.addEventListener('mouseenter', () => loopTimeline.pause());
        projectsContainer.addEventListener('mouseleave', () => loopTimeline.resume());


        // Video Play/Pause functionality on individual cards
        projectCards.forEach(card => {
            const video = card.querySelector('.card-video');

            card.addEventListener('mouseenter', () => {
                if (video) {
                    video.currentTime = 0; // Rewind video to start
                    video.play().catch(error => console.log('Video play blocked:', error));
                }
            });

            card.addEventListener('mouseleave', () => {
                if (video) {
                    video.pause();
                }
            });
        });


        // Add GSAP ScrollTrigger to start the animation when the section enters the viewport
          ScrollTrigger.create({
            trigger: "#work",
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
                // Animation ko tabhi resume/pause karo jab section viewport mein ho
                if (self.isActive) {
                    loopTimeline.resume();
                } else {
                    loopTimeline.pause();
                    // Pause all videos when scrolling out of view
                    projectCards.forEach(card => {
                        const video = card.querySelector('.card-video');
                        if (video) video.pause();
                    });
                }
            },
        });
    }
function initSoftSkillsLoop() {
        const track = document.getElementById('soft-skills-track');
        // Original cards ko select karna
        const originalCards = Array.from(track.querySelectorAll('.soft-skill-card:not(.clone)'));
        
        if (originalCards.length === 0) return;

        // Cards ko clone karna
        const cardCount = originalCards.length;
        for (let i = 0; i < cardCount; i++) {
            const clone = originalCards[i].cloneNode(true);
            clone.classList.add('clone');
            track.appendChild(clone);
        }

        // Card ki dimensions (CSS se match honi chahiye)
        const CARD_WIDTH = 300; 
        const MARGIN = 30; // 15px left + 15px right
        
        // Calculate the distance to move (width of the original set of cards + margins)
        const singleSetMoveDistance = cardCount * CARD_WIDTH + (cardCount * MARGIN);
        // 🟢 NON-TECHNICAL SKILLS TEXT ZOOM ON HOVER LOGIC 🟢
function initSoftSkillsHoverZoom() {
    const cards = document.querySelectorAll('.soft-skill-card');

    cards.forEach(card => {
        const textElement = card.querySelector('p');
        
        // --- MOUSE ENTER (Hover Start) ---
        card.addEventListener('mouseenter', () => {
            gsap.to(textElement, {
                fontSize: "1.1em", // Thoda aur bada size for visible zoom
                lineHeight: 1.6, // Reading ko improve karne ke liye line-height
                duration: 0.5, // Animation ko slow kiya
                
                ease: "power2.out"
            });
        });

        // --- MOUSE LEAVE (Hover End) ---
        card.addEventListener('mouseleave', () => {
            gsap.to(textElement, {
                fontSize: "0.9em", // Original size par wapas
                lineHeight: 1.4,
                duration: 0.5, // Animation ko slow kiya
                ease: "power2.out"
            });
        });

        // Initial state set karna
        gsap.set(textElement, { fontSize: "0.9em", lineHeight: 1.4 });
    });
}
// Is function ko initAnimations ke end mein call kiya jaata hai.
// ... (Ye code pehle se hi document.addEventListener ke andar hai)
        // Track width set karna
        gsap.set(track, { width: singleSetMoveDistance * 2 }); 
const softSkillsContainer = document.querySelector('.soft-skills-container-wrapper');
        const LOOP_DURATION =  5; // Thoda slow loop

        // Define the infinite animation (Right-to-Left loop for continuous flow)
        const loopTimeline = gsap.timeline({
            repeat: -1, // Loop forever
            paused: true,
            defaults: { ease: "linear", duration: LOOP_DURATION } 
        });

        // Animate the track to the left by one full set of cards (for Left-to-Right visual movement)
        loopTimeline.fromTo(track, 
            { x: -singleSetMoveDistance }, // Start from the position where clones begin
            { x: 0, ease: "linear", duration: LOOP_DURATION } // Animate back to 0
        );

        // ScrollTrigger to start the animation when the section enters the viewport
          ScrollTrigger.create({
            trigger: "#soft-skills",
            start: "top bottom", // Jab section dikhna shuru ho
            end: "bottom top",
            onToggle: (self) => {
                // Animation ko tabhi resume/pause karo jab section viewport mein ho
                if (self.isActive) {
                    loopTimeline.resume();
                } else {
                    loopTimeline.pause();
                }
            },
        });
        softSkillsContainer.addEventListener('mouseenter', () => loopTimeline.pause());
    softSkillsContainer.addEventListener('mouseleave', () => loopTimeline.resume());
    }
initSoftSkillsHoverZoom();
    initProjectsLoop();
    initSoftSkillsLoop(); // 🟢 NEW: Soft Skills loop ko initialize karo
    initTypewriter(); 
}
// 🟢 NON-TECHNICAL SKILLS TEXT ZOOM ON HOVER LOGIC 🟢
function initSoftSkillsHoverZoom() {
    const cards = document.querySelectorAll('.soft-skill-card');

    cards.forEach(card => {
        const textElement = card.querySelector('p');
        
        // --- MOUSE ENTER (Hover Start) ---
        card.addEventListener('mouseenter', () => {
            gsap.to(textElement, {
                fontSize: "1em", // Text size ko bada karo
                lineHeight: 1.5,
                duration: 0.5, // 🟢 MODIFIED: Animation ko slow kiya (0.3s se 0.5s)
                ease: "power2.out"
            });
        });

        // --- MOUSE LEAVE (Hover End) ---
        card.addEventListener('mouseleave', () => {
            gsap.to(textElement, {
                fontSize: "0.9em", // Original size par wapas
                lineHeight: 1.4,
                duration: 0.5, // 🟢 MODIFIED: Animation ko slow kiya
                ease: "power2.out"
            });
        });

        // Initial state set karna zaroori hai (CSS initial state se match kare)
        gsap.set(textElement, { fontSize: "0.9em", lineHeight: 1.4 });
    });
}

// --- Typewriter Effect Logic ---
const phrases = ["IT Engineer", "Full Stack Developer", "Python Programmer"];
const typingElement = document.getElementById('typewriter-text');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function initTypewriter() {
    // Ye function DOMContentLoaded ke baad chalaana hai.
    // Pehle initial delay ke baad typing shuru ho.
    setTimeout(type, 4000); 
}

function type() {
    const currentPhrase = phrases[phraseIndex];
    let speed = 150; // Typing speed (ms)

    if (isDeleting) {
        // Deleting Mode
        speed = 75; // Fast deleting
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Typing Mode
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    // Check if phrase is fully typed
    if (!isDeleting && charIndex === currentPhrase.length) {
        // Wait after typing complete
        speed = 1500; 
        isDeleting = true;
    } 
    // Check if phrase is fully deleted
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        // Move to next phrase
        phraseIndex = (phraseIndex + 1) % phrases.length; 
        speed = 500; // Pause after deletion before next word starts
    }

    // Loop the function
    setTimeout(type, speed);
}

document.addEventListener('DOMContentLoaded', () => {
    // Set initial GSAP positions 
    gsap.set(".nav-item", { y: -30 });
    gsap.set(".hero-line", { y: 30 });
    gsap.set(".hero-image-placeholder-gsap", { y: 30, x: 30 });
    
    // Typewriter logic initAnimations ke andar call ho raha hai
    initAnimations();
});
