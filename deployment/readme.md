-- test truy cập ssh
ansible all -m shell -a "docker --version"

-- kiểm tra syntax
ansible-playbook deploy.yml --check --ask-vault-pass

-- mã hoá env
ansible-vault encrypt vars/secrets.yml

-- giải mã để xem (nhập password)
ansible-vault view vars/secrets.yml