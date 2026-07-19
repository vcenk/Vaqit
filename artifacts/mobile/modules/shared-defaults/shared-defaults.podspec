require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'shared-defaults'
  s.version        = package['version']
  s.summary        = package['description']
  s.license        = 'MIT'
  s.authors        = 'Vaqit'
  s.homepage       = 'https://vaqit.online'
  s.platforms      = { :ios => '16.0' }
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files   = 'ios/**/*.{h,m,mm,swift,hpp,cpp}'
end
