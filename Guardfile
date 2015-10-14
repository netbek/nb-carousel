notification :off

group :development do

  guard :shell do
    puts 'Monitoring source files.'

    watch(%r{src/.+\.(css|js)$}) { |m|
      puts 'Change detected: ' + m[0]
     `grunt`
    }
  end

end
