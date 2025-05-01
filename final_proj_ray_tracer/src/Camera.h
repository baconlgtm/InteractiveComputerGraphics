#pragma once
#include "Vec3.h"
#include "Ray.h"
#include "Utility.h"
#include <cmath>
#include <iostream>

class Camera {
public:
    Camera(Vec3 lookfrom, Vec3 lookat, Vec3 up, double field_of_view, double aspect_ratio, double aperture, double dist){
        r = aperture / 2.0;
        orig = lookfrom;

        w = (lookfrom - lookat).vec3_unit();
        u = cross(up, w).vec3_unit();
        v = w.cross(u);

        double theta = degToRad(field_of_view);
        double height = 2.0 * tan(theta / 2);
        double half_height = height / 2.0;
        double width = aspect_ratio * height;
        double half_width = width / 2.0;

        horiz = u * width * dist;
        vert = v * height * dist;
        llc = orig - u * half_width * dist - v * half_height * dist - w * dist;
    }

    /**
     * Get a pixel ray
     */
    Ray get_camera_ray(double s, double t){
        Vec3 rd = r * get_random_disk();
        Vec3 off_set = u * rd.x + v * rd.y;
        return Ray(orig + off_set, llc + vert * t + horiz * s - off_set - orig);
    }

private:
    Vec3 orig;
    Vec3 horiz;
    Vec3 vert;
    Vec3 llc; // lower_left_corner
    Vec3 u, v, w;
    double r;
};