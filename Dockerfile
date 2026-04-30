FROM docker.io/cloudflare/sandbox:0.9.2-opencode

# Clone sample project for the web UI to work with
RUN git clone --depth 1 https://github.com/visatk/cybercoderbd.com.git /home/user/agents

RUN npx skills add https://github.com/cloudflare/skills
# Start in the sample project directory
WORKDIR /home/user/agents

# Expose OpenCode server port
EXPOSE 4096
