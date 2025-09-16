import React from 'react';

const About = () => {
  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'Lead Developer',
      description: 'Full-stack developer with expertise in React and Node.js. Passionate about creating scalable web applications.',
      image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Alex',
      github: 'github.com/alexchen',
      linkedin: 'linkedin.com/in/alexchen',
      specialties: ['React', 'Node.js', 'AWS']
    },
    {
      name: 'Sarah Johnson',
      role: 'UX Designer',
      description: 'Creative designer focused on user-centered design principles and building intuitive interfaces.',
      image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Sarah',
      github: 'github.com/sarahj',
      linkedin: 'linkedin.com/in/sarahjohnson',
      specialties: ['UI/UX', 'Figma', 'User Research']
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Backend Engineer',
      description: 'Database expert specializing in high-performance systems and data optimization.',
      image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Marcus',
      github: 'github.com/marcusrod',
      linkedin: 'linkedin.com/in/marcusrodriguez',
      specialties: ['Python', 'PostgreSQL', 'Redis']
    },
    {
      name: 'Emily Zhang',
      role: 'Frontend Developer',
      description: 'Frontend specialist with a keen eye for animations and responsive design.',
      image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Emily',
      github: 'github.com/emilyzhang',
      linkedin: 'linkedin.com/in/emilyzhang',
      specialties: ['Vue.js', 'CSS', 'WebGL']
    },
    {
      name: 'David Kumar',
      role: 'DevOps Engineer',
      description: 'Infrastructure expert ensuring smooth deployments and optimal system performance.',
      image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=David',
      github: 'github.com/davidk',
      linkedin: 'linkedin.com/in/davidkumar',
      specialties: ['Docker', 'Kubernetes', 'CI/CD']
    },
    {
      name: 'Lisa Anderson',
      role: 'Quality Assurance',
      description: 'Detail-oriented QA engineer dedicated to delivering bug-free software.',
      image: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Lisa',
      github: 'github.com/lisaa',
      linkedin: 'linkedin.com/in/lisaanderson',
      specialties: ['Testing', 'Automation', 'Security']
    }
  ];

  return (
    <div className="container">
      <div className="header">
        <h1 className="header__title">Our Team</h1>
        <p className="header__subtitle">Meet the talented individuals behind AquaNexa</p>
      </div>

      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div className="team-card" key={index}>
            <div className="team-card__image-container">
              <img
                src={member.image}
                alt={member.name}
                className="team-card__image"
              />
              <div className="team-card__image-overlay"></div>
            </div>
            
            <div className="team-card__content">
              <h3 className="team-card__name">{member.name}</h3>
              <span className="team-card__role">{member.role}</span>
              <p className="team-card__description">{member.description}</p>
              
              <div className="team-card__specialties">
                {member.specialties.map((specialty, idx) => (
                  <span key={idx} className="team-card__specialty">
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="team-card__social">
                <a
                  href={`https://${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-card__social-link"
                >
                  <svg className="team-card__social-icon" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                  </svg>
                </a>
                <a
                  href={`https://${member.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-card__social-link"
                >
                  <svg className="team-card__social-icon" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
