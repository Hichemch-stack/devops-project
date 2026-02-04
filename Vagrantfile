Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  config.vm.hostname = "jenkins-ci"

  # IP privée fixe
  config.vm.network "private_network", ip: "192.168.56.20"

  # Forward des ports vers l'hôte pour accéder aux services
  config.vm.network "forwarded_port", guest: 8080, host: 8080 # Jenkins
  config.vm.network "forwarded_port", guest: 8081, host: 8081  # Backend API
  config.vm.network "forwarded_port", guest: 4200, host: 4200  # Frontend
  config.vm.network "forwarded_port", guest: 9000, host: 9000  # SonarQube
  config.vm.network "forwarded_port", guest: 8082, host: 8082 # Nexus
  config.vm.network "forwarded_port", guest: 9090, host: 9090 # Prometheus
  config.vm.network "forwarded_port", guest: 3000, host: 3000 # Grafana
  config.vm.network "forwarded_port", guest: 8085, host: 8085 # Zabbix

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "8192"
    vb.cpus = 2
  end
end

