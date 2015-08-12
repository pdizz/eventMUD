class nodejs {
  exec { 'install epel repo':
    command => 'sudo yum install -y epel-release',
    path    => '/usr/bin',
    creates => '/etc/yum.repos.d/epel.repo'
  }
->
  exec { 'install node and npm':
    command => 'sudo yum install -y nodejs npm --enablerepo=epel',
    path    => '/usr/bin',
    creates => '/usr/bin/node'
  }
->
  exec { 'npm install':
    command => 'npm install',
    path    => '/usr/bin',
  # have to run command in the project dir containing package.json
    cwd     => '/vagrant'
  }
}