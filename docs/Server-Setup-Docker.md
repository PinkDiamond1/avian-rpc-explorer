### Setup of https://avianexplorer.org on Ubuntu 20.04

	# update and install packages
	apt update
	apt upgrade
	apt install docker.io
	
	# get source, npm install
	git clone https://github.com/janoside/avn-rpc-explorer.git
	cd avn-rpc-explorer
	
	# build docker image
	docker build -t avn-rpc-explorer .

	# run docker image: detached mode, share port 3002, sharing config dir, from the "avn-rpc-explorer" image made above
	docker run --name=avn-rpc-explorer -d -v /host-os/env-dir:/container/env-dir --network="host" avn-rpc-explorer
	