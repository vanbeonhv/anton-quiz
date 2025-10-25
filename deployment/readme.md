ansible all -m shell -a "docker --version"

ansible-playbook deploy.yml --check