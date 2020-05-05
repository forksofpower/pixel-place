class PaintsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def create
        x, y = params[:x], params[:y]
        @paint = Paint.create({
            color: paint_params[:color],
            user: User.find(1),
            pixel: Pixel.where(x: x, y: y).first_or_create    
        })
        
        render json: @paint.to_json(
            :include => {
                :user => {:only => [:username]},
                :pixel => {:only => [:x, :y]}
            }, 
            :except => [:updated_at]
        )
    end

    private
        def paint_params
            params.require(:paint).permit(:x, :y, :color)
        end
end
