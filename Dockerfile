FROM node:14
WORKDIR /usr/src/apps
RUN ln -sf /usr/share/zoneinfo/America/Denver /etc/localtime # verify this command works for this image
RUN git clone https://github.com/johndwalker/proetusemu.git
WORKDIR /usr/src/apps/proetusemu
RUN npm install
EXPOSE 3000
# If you are building your code for production
# RUN npm ci --only=production
CMD [ "node", "index.js" ]