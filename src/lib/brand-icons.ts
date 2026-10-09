export interface BrandDefinition {
  label: string;
  src: string;
}

const BRANDS: Record<string, BrandDefinition> = {
  "go": { label: "Go", src: "/brand-icons/devicon-go-d0400ee3.svg" },
  "java": { label: "Java", src: "/brand-icons/devicon-java-7582e518.svg" },
  "react": { label: "React", src: "/brand-icons/devicon-react-5825b649.svg" },
  "python": { label: "Python", src: "/brand-icons/devicon-python-71493b4a.svg" },
  "typescript": { label: "TypeScript", src: "/brand-icons/devicon-typescript-c9191199.svg" },
  "javascript": { label: "JavaScript", src: "/brand-icons/devicon-javascript-0656ff65.svg" },
  "node.js": { label: "Node.js", src: "/brand-icons/devicon-nodejs-3218687c.svg" },
  "spring": { label: "Spring", src: "/brand-icons/devicon-spring-4bae9272.svg" },
  "spring boot": { label: "Spring Boot", src: "/brand-icons/devicon-spring-4bae9272.svg" },
  "kafka": { label: "Kafka", src: "/brand-icons/devicon-apachekafka-2505c5b6.svg" },
  "postgresql": { label: "PostgreSQL", src: "/brand-icons/devicon-postgresql-f220a436.svg" },
  "docker": { label: "Docker", src: "/brand-icons/devicon-docker-3fd830ea.svg" },
  "aws": { label: "AWS", src: "/brand-icons/devicon-amazonwebservices-5b4d8371.svg" },
  "kubernetes": { label: "Kubernetes", src: "/brand-icons/devicon-kubernetes-fb31e416.svg" },
  "next.js": { label: "Next.js", src: "/brand-icons/devicon-nextjs-d9435c4e.svg" },
  "vue": { label: "Vue", src: "/brand-icons/devicon-vuejs-4cc11536.svg" },
  "mysql": { label: "MySQL", src: "/brand-icons/devicon-mysql-f73fa5d6.svg" },
  "redis": { label: "Redis", src: "/brand-icons/devicon-redis-4707378b.svg" },
  "mongodb": { label: "MongoDB", src: "/brand-icons/devicon-mongodb-d9f2bf70.svg" },
  "git": { label: "Git", src: "/brand-icons/devicon-git-717a57ea.svg" },
  "rust": { label: "Rust", src: "/brand-icons/devicon-rust-16c6c6a9.svg" },
  "c#": { label: "C#", src: "/brand-icons/devicon-csharp-7093478d.svg" },
  "c++": { label: "C++", src: "/brand-icons/devicon-cplusplus-7ff82535.svg" },
  ".net": { label: ".NET", src: "/brand-icons/devicon-dotnetcore-b1b71d74.svg" },
  "flutter": { label: "Flutter", src: "/brand-icons/devicon-flutter-c1882490.svg" },
  "angular": { label: "Angular", src: "/brand-icons/devicon-angular-9666f864.svg" },
  "linkedin": { label: "LinkedIn", src: "/brand-icons/source-linkedin.svg" },
  "itviec": { label: "ITviec", src: "/brand-icons/source-itviec.svg" },
  "topcv": { label: "TopCV", src: "/brand-icons/source-topcv.svg" },
  "vietnamworks": { label: "VietnamWorks", src: "/brand-icons/source-vietnamworks.svg" },
  "lever": { label: "Lever", src: "/brand-icons/source-lever.svg" },
  "vng": { label: "VNG Careers", src: "/brand-icons/source-vng.svg" },
  "github": { label: "GitHub", src: "/brand-icons/simple-icons-github-3bf8ccee.svg" },
  "google": { label: "Google", src: "/brand-icons/simple-icons-google-d8cf9fb2.svg" },
  "greenhouse": { label: "Greenhouse", src: "/brand-icons/source-greenhouse.svg" },
  "canonical": { label: "Canonical", src: "/brand-icons/simple-icons-canonical-0db1b854.svg" },
};

const ALIASES: Record<string, string> = {
    "via itviec": "itviec", "itviec vietnam": "itviec",
  "via topcv": "topcv", "topcv vietnam": "topcv",
  "via vietnamworks": "vietnamworks",
  "via linkedin": "linkedin", "linkedin jobs": "linkedin",
  "via greenhouse": "greenhouse", "greenhouse io": "greenhouse",
  "via lever": "lever",
  "via vng": "vng", "vng careers": "vng", "via vng careers": "vng",
  golang: "go", nodejs: "node.js", node: "node.js", nextjs: "next.js",
  "vue.js": "vue", "react.js": "react", "amazon web services": "aws",
  "apache kafka": "kafka", k8s: "kubernetes", "dotnet": ".net", "csharp": "c#",
};

export function getBrandDefinition(name: string): BrandDefinition | undefined {
  const key = name.trim().toLowerCase();
  return BRANDS[ALIASES[key] || key];
}

export function getBrandLabel(name: string): string {
  return getBrandDefinition(name)?.label || name;
}

