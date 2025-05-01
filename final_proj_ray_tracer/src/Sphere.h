#pragma once
//#include "Hittable.h"
#include "Vec3.h"
#include "Ray.h"
#include <cmath>

using std::sqrt;

class Sphere{
public:
    double radius;
    Vec3 center;
    Vec3 color;
    int material_type;
    double fuzz;

    Sphere(){}

    Sphere(double r, Vec3 center_loc, Vec3 sphere_color, int m){
        radius = r;
        center = center_loc;
        color = sphere_color;
        material_type = m;
        fuzz = 0.0;
    }

    /**
     * fix shadow acne
     */
    double fix_shadow_acne(double t, double t_min){
        double res = 0.0;
        if(t >= t_min || t <= -t_min){
            res = t;
        }
        return res;
    }

    /**
     * hit
     */
    double sphere_hit(const Ray& r){
        Vec3 oc = r.orig - center;
        double a = dot(r.dir, r.dir);
        double h = oc.dot(r.dir);
        double c = dot(oc, oc) - radius*radius;
        double discriminant = h*h - a*c;
        if(discriminant >= 0){
            double temp = -h - sqrt(discriminant);
            double t = temp / a;
            return fix_shadow_acne(t, 0.001);
        }else{
            return -1.0;
        }
    }

    /**
     * Set metal's fuzz
     */
    void set_fuzz(double f){
        fuzz = f;
    }
    
};



