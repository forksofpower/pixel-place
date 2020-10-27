require 'connection_pool'
$redis = Redis.new

REDIS = ConnectionPool.new(size: 10) { Redis.new }