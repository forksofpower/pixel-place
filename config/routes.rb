Rails.application.routes.draw do

  resources :paints
  post 'paints/:x/:y', to: "paints#create"

  resources :pixels
  get 'pixels/:x/:y', to: "pixels#show"

  resources :users
  root "place#index"
end
