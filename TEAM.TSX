<section className="py-16 bg-gradient-to-br from-white to-gray-100">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="h2 mb-4" style={{ textShadow: "2px 2px 4px rgba(128, 128, 128, 0.6)" }}>Our Leadership Team</h2>
            <p className="text-foreground/80">
              Meet the dedicated people behind DO!T
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "Lezcano Jorge D",
                role: "Founder",
                bio: "Jorge brings over 10 years of experience in service management and entrepreneurship to the team.",
                linkedin: "https://linkedin.com/in/jorge-lezcano"
              },
              {
                name: "Abdul Nasir",
                role: "Co-Founder & CEO",
                bio: "Nasir has a strong background in business development and strategic planning for tech startups.",
                linkedin: "https://linkedin.com/in/abdul-nasir"
              },
              {
                name: "Santhosh Patel",
                role: "Co-Founder & CTO",
                bio: "Santhosh is a technology enthusiast with expertise in building scalable software architectures.",
                linkedin: "https://linkedin.com/in/santhosh-patel"
              },
              {
                name: "Jayraj Araj",
                role: "FSDE Full Stack Development Engineer",
                bio: "Jayraj is passionate about creating intuitive user experiences with modern web technologies.",
                linkedin: "https://linkedin.com/in/jayraj-araj"
              },
              {
                name: "Shresth Jindal",
                role: "FSDE Full Stack Development Engineer",
                bio: "Shresth specializes in full-stack development with a focus on performance optimization.",
                linkedin: "https://linkedin.com/in/shresth-jindal"
              },
            ].map((member, index) => (
              <div key={member.name} 
                   style={{ perspective: "1000px" }}
                   className="h-[340px] w-full">
                <div className="relative h-full w-full transition-all duration-700 rounded-2xl shadow-xl"
                     style={{ transformStyle: "preserve-3d" }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = "rotateY(180deg)"}
                     onMouseLeave={(e) => e.currentTarget.style.transform = "rotateY(0)"}>
                  {/* Front of Card */}
                  <div className="absolute h-full w-full rounded-2xl overflow-hidden 
                                bg-gradient-to-br from-white to-gray-50 border-2 border-doit-100"
                       style={{ backfaceVisibility: "hidden" }}>
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute -inset-[100%]"
                           style={{ 
                             background: "radial-gradient(circle at 50% 120%, rgba(120,119,198,0.3), rgba(255,255,255,0))",
                             animation: "spin 20s linear infinite"
                           }}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 flex flex-col items-center justify-center h-full">
                      {/* Circle with initial */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-doit-100 to-doit-300 border-4 border-white
                                    shadow-inner shadow-doit-500/20 flex items-center justify-center
                                    mb-6 transition-transform duration-500 hover:scale-110">
                        <span className="text-4xl font-bold text-doit-800">{member.name.charAt(0)}</span>
                      </div>
                      
                      {/* Name with animated underline */}
                      <div className="relative group">
                        <h3 className="text-2xl font-bold mb-2 text-doit-900">{member.name}</h3>
                        <div className="h-[3px] w-0 bg-gradient-to-r from-doit-400 via-orange-400 to-doit-400
                                     absolute bottom-0 left-1/2 -translate-x-1/2 group-hover:w-full transition-all duration-700"></div>
                      </div>
                      
                      <p className="text-doit-600 font-medium mt-1">{member.role}</p>
                      
                      {/* Floating hint text */}
                      <div className="absolute bottom-4 right-4 text-sm text-doit-400 opacity-0 
                                   group-hover:opacity-100 transition-opacity duration-500 delay-300">
                        <span className="inline-flex items-center gap-1">
                          <span>Hover to flip</span>
                          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Back of Card */}
                  <div className="absolute h-full w-full rounded-2xl overflow-hidden
                                bg-gradient-to-tr from-doit-50 to-white p-6 flex flex-col"
                       style={{ 
                         backfaceVisibility: "hidden",
                         transform: "rotateY(180deg)"
                       }}>
                    {/* Accent corner */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-doit-300 to-orange-400 
                                  transform rotate-45 translate-x-10 -translate-y-10"></div>
                    
                    <div className="flex-1 flex flex-col justify-between relative z-10">
                      {/* Header */}
                      <div>
                        <h3 className="text-xl font-bold text-doit-800 mb-1">{member.name}</h3>
                        <p className="text-sm text-doit-600 mb-4">{member.role}</p>
                      </div>
                      
                      {/* Bio with animated reveal */}
                      <div className="flex-1 overflow-hidden">
                        <p className="text-gray-700 leading-relaxed"
                           style={{
                             animation: "fadeIn 0.8s 0.2s forwards",
                             opacity: 0,
                             transform: "translateY(10px)"
                           }}>
                          {member.bio}
                        </p>
                      </div>
                      
                      {/* LinkedIn button with animated hover */}
                      <div className="mt-auto pt-4">
                        <a href={member.linkedin} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="relative group inline-flex items-center gap-2 bg-white hover:bg-doit-50 
                                    text-doit-700 font-medium py-3 px-5 rounded-lg border border-doit-200
                                    transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
                          {/* Animated background effect */}
                          <span className="absolute inset-0 w-0 bg-gradient-to-r from-doit-100/40 to-transparent
                                         group-hover:w-full transition-all duration-700"></span>
                          <FaLinkedin size={18} className="relative z-10 text-doit-600" />
                          <span className="relative z-10">Connect on LinkedIn</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>