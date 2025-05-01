#include <stdio.h>
#include <stdlib.h>
#include <cmath>
#include <iostream>
#include <fstream>
#include <vector>
#include "Vec3.h"
#include "Ray.h"
#include "Utility.h"
#include "Camera.h"
#include "Sphere.h"
#include "Color.h"

using namespace std;

// store sphere's information (world)
vector<Sphere> sphere_list;

/**
 * Set up the spheres
 */
void random_scene(){
    sphere_list.clear();
    Vec3 plane_color(0.5,0.5,0.5);
    Vec3 black(0, 0, 0);
    sphere_list.push_back(Sphere(1000, Vec3(0,-1000,0), plane_color, 1)); //bottom

    // create random sphere
    for (int a = -10; a < 10; a++) {
        for (int b = -10; b < 10; b++) {
            bool skipflag = get_random_double() < 0.5;
            if(skipflag){
                continue;
            }
            auto type_random = get_random_double();
            bool whetherfloat = get_random_double() <= 0.5;
            double radius = get_random_double_min_max(0.1,0.2);
            Vec3 center;
            if(whetherfloat){
                center = Vec3(a + 0.9*get_random_double(), radius, b + 0.9*get_random_double());
            }else{
                double random_height = get_random_double_min_max(0.1, 2);
                center = Vec3(a + 0.9*get_random_double(), random_height, b + 0.9*get_random_double());
            }
            Vec3 random_color = get_random_vec();
            //if (((center - Vec3(-4, 0.8, 0)).length() > 1.2 ) && ((center - Vec3(-0.5, 1, 0)).length() > 1.5 ) && ((center - Vec3(4.5, 1.5, 0)).length() > 2.2 )) {
            if (((center - Vec3(-4.5, 1.0, 0)).length() > 2.0 ) && ((center - Vec3(0, 1.5, 0)).length() > 2.5 )&& ((center - Vec3(3, 0.5, 4)).length() > 0.8 )) {
                if (type_random < 0.6) {
                    // diffuse
                    sphere_list.push_back(Sphere(radius, center, random_color, 1));
                } else if (type_random < 0.75) {
                    // metal
                    sphere_list.push_back(Sphere(radius, center, Vec3(0.7,0.6,0.5), 2));
                } else {
                    // glass
                    sphere_list.push_back(Sphere(radius, center, Vec3(1,1,1), 3));
                }
            }
        }
    }

    // set background
    sphere_list.push_back(Sphere(1000, Vec3(0,1000 + 20,0), black, 4));
    sphere_list.push_back(Sphere(1000, Vec3(-1000 - 8,0,0), black, 4));
    sphere_list.push_back(Sphere(100000, Vec3(100000 + 8,2,0), black, 4));
    sphere_list.push_back(Sphere(1000, Vec3(0,0,1000+20), black, 4));
    sphere_list.push_back(Sphere(1000, Vec3(0,0,-1000-20), black, 4));
    sphere_list.push_back(Sphere(30, Vec3(37.9,2,0), Vec3(1,1,1), 4)); //light source
    
    // large spheres 
    // sphere_list.push_back(Sphere(0.8, Vec3(-4.0,0.8,0), Vec3(0.7,0.6,0.5), 2));
    // sphere_list.push_back(Sphere(1, Vec3(-0.5,1,0), Vec3(0.22,0.77,0.73), 1));
    // sphere_list.push_back(Sphere(1.5, Vec3(4.5,1.5,0), Vec3(1,1,1), 3));

    sphere_list.push_back(Sphere(1.5, Vec3(0,1.5,0), Vec3(0.7,0.6,0.5), 2));
    sphere_list.push_back(Sphere(1.0, Vec3(4.5,1.0,0), Vec3(1,1,1), 3));
    sphere_list.push_back(Sphere(0.2, Vec3(4.2,0.2,-1.2), Vec3(0.22,0.77,0.73), 1));
    sphere_list.push_back(Sphere(0.5, Vec3(3,0.5,4), Vec3(0.22,0.77,0.73), 1));
}

/**
 * Calculate R' with refraction
 */
Vec3 refract(const Vec3& uDirection, const Vec3& vNormal, double refraction_ratio) {
    auto cosine = fmin(dot(negate_vec(uDirection), vNormal), 1.0);
    Vec3 r_perp =  refraction_ratio * (uDirection + cosine*vNormal);
    Vec3 r_parallel = -sqrt(fabs(1.0 - r_perp.length_squared())) * vNormal;
    return r_perp + r_parallel;
}

/**
 * Calculate R' with reflection
 */
Vec3 reflect(const Vec3& viewPt, const Vec3& vNormal) {
    return viewPt - 2*vNormal*dot(viewPt,vNormal);
}

/**
 *  Use Schlick's approximation for reflectance.
 */
double reflectance(double cos_theta, double refraction_ratio) {
    auto r = (1-refraction_ratio) / (1+refraction_ratio);
    r = r*r;
    return r + (1-r)*pow((1 - cos_theta),5);
}

/**
 *  returns the color of the background. material_type = 1 is diffuse, material_type = 2 is metal
 *  material_type = 3 is dielectric
 */
Vec3 get_ray_color(const Ray &r, int d, int max_d){
    // end recursion
    if(d >= max_d) return Vec3(0,0,0);

    bool flag = false;
    Sphere closest_sphere;
    double min = max_val;
    // find the closest sphere
    for(auto & p: sphere_list){
        double temp = p.sphere_hit(r);
        if(temp > 0){
            flag = true;
            if(temp < min){
                closest_sphere = p;
                min = temp;
            }
        }
    }
    if(flag){
        // find the hit point and calculate normal
        Vec3 hit_point = r.at(min);
        Vec3 outward_n = (hit_point - closest_sphere.center) / closest_sphere.radius;
        outward_n = outward_n.vec3_unit();
        bool front_face = dot(r.dir, outward_n) < 0;
        Vec3 sphere_normal = front_face ? outward_n : negate_vec(outward_n);
        int material_type = closest_sphere.material_type;
        Vec3 sphere_color = closest_sphere.color;
        if(material_type == 1){ //diffuse
            Vec3 target = hit_point + sphere_normal + get_random_unit_sphere();
            return sphere_color * get_ray_color(Ray(hit_point, target - hit_point), d++, max_d);
        }
        if(material_type == 2){ //metal
            Vec3 unit_direction = r.dir.vec3_unit();
            Vec3 direction = reflect(unit_direction, sphere_normal);
            // using fuzz reflection
            double fuzz = closest_sphere.fuzz < 1 ? closest_sphere.fuzz: 1;
            Ray scattered = Ray(hit_point, direction + fuzz * get_random_unit_sphere());
            return sphere_color * get_ray_color(scattered, d++, max_d);
        }
        if(material_type == 3){ //dielec
            double ir = 1.52;
            double refraction_ratio = front_face ? (1.0/ir) : ir;
            Vec3 unit_dir = r.dir.vec3_unit();
            double cos_theta = fmin(dot(negate_vec(unit_dir), sphere_normal), 1.0);
            double sin_theta = sqrt(1.0 - cos_theta*cos_theta);

            bool refract_flag = refraction_ratio * sin_theta > 1.0;
            Vec3 direction;
            if (refract_flag || reflectance(cos_theta, refraction_ratio) > get_random_double()){
                // using reflect
                direction = reflect(unit_dir, sphere_normal);
                double fuzz = closest_sphere.fuzz < 1 ? closest_sphere.fuzz: 1;
                Ray scattered = Ray(hit_point, direction + fuzz * get_random_unit_sphere());
                return sphere_color * get_ray_color(scattered, d++, max_d);
            }else{
                // refract
                direction = refract(unit_dir, sphere_normal, refraction_ratio);
                return get_ray_color(Ray(hit_point, direction), d++, max_d);
            }
        }
        if(material_type == 4){
            return sphere_color;
        }
    }

    Vec3 unit_dir = r.dir.vec3_unit();
    auto t = 0.5*(unit_dir.y + 1.0);
    return (1.0-t)*Vec3(1.0, 1.0, 1.0) + t*Vec3(0.5, 0.7, 1.0);
}


int main(int argc, char **argv){
    // set the image format
    const double aspect_ratio = 3.0 / 2.0;
    const int width = 750;
    const int height = static_cast<int>(width / aspect_ratio);
    const int samples_per_pixel = 100;
    const int max_d = 20;
    //srand(time(NULL));

    // set the camera
    //Vec3 lookfrom(-15,4,6);
    Vec3 lookfrom(14,3.5,8);
    Vec3 lookat(0,0,0);
    Vec3 up(0,1,0);
    Camera cam(lookfrom, lookat, up, 20, aspect_ratio, 0.1, 10);

    // set the spheres
    random_scene();

    // output
    std::cout << "P3\n" << width << " " << height << "\n255\n";
    for (int j = height-1; j >= 0; --j) {
        std::cerr << "\rScanlines remaining: " << j << ' ' << std::flush;
        for (int i = 0; i < width; ++i) {
            Vec3 color_point(0, 0, 0);
            for (int s = 0; s < samples_per_pixel; ++s) {
                auto u = (i + get_random_double()) / (width-1);
                auto v = (j + get_random_double()) / (height-1);
                Ray r = cam.get_camera_ray(u, v);
                color_point += get_ray_color(r, 0, max_d);
            }
            write_color(std::cout, color_point, samples_per_pixel);
        }
    }
    std::cerr << "\nDone!\n";
}