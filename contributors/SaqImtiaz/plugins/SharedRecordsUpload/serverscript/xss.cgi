#!/usr/bin/ruby
require 'cgi'
require 'net/http'
require 'uri'
require 'open-uri'
require 'digest/sha1'


  cgi = CGI.new
 
  url = cgi.params['url'][0]
  mode = cgi.params['mode'][0]
 
  data = open(url).read.to_s
  recordid = Digest::SHA1.hexdigest(data)

  serverurl = "http://sra.sharedrecords.org"
  serverpath = "/SRCDataStore/RESTServlet/#{recordid}"
  finalurl = "#{serverurl}:8080#{serverpath}"

  x = Net::HTTP.new(URI.parse(serverurl).host,8080)
  resp, body = x.post(serverpath,data,{'Content-Type' => 'text/html'})

  status = resp.message == 'OK'? 'true' : 'false'
  statusText = resp.message
  code = resp.code


  if mode == 'json'
    callback = cgi.params['callback'][0]
    output = "#{callback}(#{status},'#{statusText}','#{body}','#{finalurl}','#{code}');"
  elsif mode == 'bk'
    output = status == 'true'? "File saved successfully to: #{finalurl}" : "There was an error saving the file. Error code:#{code},message:#{resp.message}\n#{body}"
  end

  header = {} 
  header['Content-Type'] = 'text/html'
  print cgi.header(header)
  print output