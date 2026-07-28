/**
 * The canonical target-role catalogue.
 *
 * Lives here rather than inline in the controller so the admin seed endpoint
 * and the `npm run seed:roles` script stay in lockstep — two copies of this
 * list would drift the moment either one is edited.
 */
module.exports = [
  // ── Web / App Development ──────────────────────────────────────────────
  {
    roleName: 'Frontend Developer',
    requiredSkills: ['javascript', 'typescript', 'react', 'html', 'css', 'tailwind', 'git', 'webpack', 'accessibility', 'responsive design']
  },
  {
    roleName: 'Backend Developer',
    requiredSkills: ['node.js', 'express', 'mongodb', 'postgresql', 'sql', 'rest api', 'graphql', 'redis', 'docker', 'git']
  },
  {
    roleName: 'Full Stack Developer',
    requiredSkills: ['javascript', 'typescript', 'react', 'node.js', 'express', 'mongodb', 'postgresql', 'tailwind', 'git', 'docker']
  },
  {
    roleName: 'React Developer',
    requiredSkills: ['react', 'javascript', 'typescript', 'redux', 'react query', 'tailwind', 'jest', 'git', 'html', 'css']
  },
  {
    roleName: 'Next.js Developer',
    requiredSkills: ['next.js', 'react', 'typescript', 'tailwind', 'api routes', 'server components', 'prisma', 'vercel', 'git', 'seo']
  },
  {
    roleName: 'Vue.js Developer',
    requiredSkills: ['vue.js', 'javascript', 'typescript', 'pinia', 'vue router', 'nuxt.js', 'tailwind', 'git', 'html', 'css']
  },

  // ── Mobile ─────────────────────────────────────────────────────────────
  {
    roleName: 'React Native Developer',
    requiredSkills: ['react native', 'javascript', 'typescript', 'expo', 'redux', 'react navigation', 'firebase', 'git', 'ios', 'android']
  },
  {
    roleName: 'Flutter Developer',
    requiredSkills: ['flutter', 'dart', 'state management', 'rest api', 'firebase', 'bloc', 'provider', 'git', 'ios', 'android']
  },
  {
    roleName: 'iOS Developer',
    requiredSkills: ['swift', 'swiftui', 'uikit', 'xcode', 'core data', 'combine', 'rest api', 'git', 'mvvm', 'alamofire']
  },
  {
    roleName: 'Android Developer',
    requiredSkills: ['kotlin', 'java', 'android sdk', 'jetpack compose', 'mvvm', 'retrofit', 'room', 'coroutines', 'git', 'firebase']
  },

  // ── Data / AI / ML ─────────────────────────────────────────────────────
  {
    roleName: 'Data Scientist',
    requiredSkills: ['python', 'machine learning', 'pandas', 'numpy', 'scikit-learn', 'sql', 'data visualization', 'statistics', 'matplotlib', 'jupyter']
  },
  {
    roleName: 'Machine Learning Engineer',
    requiredSkills: ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'mlops', 'docker', 'kubernetes', 'sql', 'numpy', 'pandas']
  },
  {
    roleName: 'AI Engineer',
    requiredSkills: ['python', 'langchain', 'openai api', 'llms', 'vector databases', 'rag', 'prompt engineering', 'fastapi', 'docker', 'git']
  },
  {
    roleName: 'Data Analyst',
    requiredSkills: ['sql', 'python', 'excel', 'tableau', 'power bi', 'statistics', 'pandas', 'data visualization', 'git', 'business intelligence']
  },
  {
    roleName: 'Data Engineer',
    requiredSkills: ['python', 'sql', 'apache spark', 'kafka', 'airflow', 'aws', 'dbt', 'postgresql', 'docker', 'kubernetes']
  },

  // ── DevOps / Cloud / SRE ───────────────────────────────────────────────
  {
    roleName: 'DevOps Engineer',
    requiredSkills: ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'github actions', 'aws', 'terraform', 'ansible', 'linux', 'monitoring']
  },
  {
    roleName: 'Cloud Engineer (AWS)',
    requiredSkills: ['aws', 'terraform', 'docker', 'kubernetes', 'iam', 's3', 'ec2', 'lambda', 'cloudformation', 'networking']
  },
  {
    roleName: 'Site Reliability Engineer',
    requiredSkills: ['kubernetes', 'docker', 'prometheus', 'grafana', 'linux', 'python', 'go', 'incident management', 'ci/cd', 'aws']
  },

  // ── Security ───────────────────────────────────────────────────────────
  {
    roleName: 'Cybersecurity Engineer',
    requiredSkills: ['network security', 'penetration testing', 'linux', 'python', 'siem', 'owasp', 'cryptography', 'firewalls', 'incident response', 'docker']
  },

  // ── Systems / Embedded ─────────────────────────────────────────────────
  {
    roleName: 'Backend Engineer (Go)',
    requiredSkills: ['go', 'grpc', 'postgresql', 'docker', 'kubernetes', 'rest api', 'microservices', 'redis', 'kafka', 'git']
  },
  {
    roleName: 'Blockchain Developer',
    requiredSkills: ['solidity', 'ethereum', 'web3.js', 'hardhat', 'smart contracts', 'javascript', 'defi protocols', 'truffle', 'ipfs', 'git']
  },

  // ── Product / Design ───────────────────────────────────────────────────
  {
    roleName: 'UI/UX Designer & Developer',
    requiredSkills: ['figma', 'html', 'css', 'javascript', 'design systems', 'user research', 'prototyping', 'accessibility', 'tailwind', 'react']
  },
  {
    roleName: 'QA / Automation Engineer',
    requiredSkills: ['selenium', 'cypress', 'jest', 'python', 'api testing', 'ci/cd', 'git', 'test planning', 'postman', 'playwright']
  }
];
