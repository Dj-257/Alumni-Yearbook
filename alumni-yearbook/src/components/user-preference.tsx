"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Quote, ChevronLeft, ChevronRight, BookOpen, Linkedin } from "lucide-react"; 
import { getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function UserPreferenceForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    number: '',
    linkedinProfile: '',
    jeevanKaFunda: '',
    iitjIs: '',
    crazyMoment: '',
    lifeTitle: '',
  });
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    photo: null as File | null,
    photoPreview: "",
    number: "",
    linkedinProfile: "",
    jeevanKaFunda: "",
    iitjIs: "",
    crazyMoment: "",
    lifeTitle: "",
  });

  useEffect(() => {
    const checkIfPreferencesCompleted = async () => {
      const session = await getSession();
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/users/check-preferences?email=${session.user.email}`, {
            cache: "no-store",
            headers: {
              Pragma: "no-cache",
              "Cache-Control": "no-cache",
            },
          });
          const data = await response.json();
          console.log("Preference check from form:", data);

          if (data.hasCompletedPreferences === true) {
            console.log("User already completed preferences, redirecting to dashboard");
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error checking preferences from form:", error);
        }
      } else {
        console.log("No session found, user may need to login");
      }
    };

    checkIfPreferencesCompleted();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      });
    }
  };

  const validateWordCount = (value: string, field: string) => {
    if (value.trim() === '') return '';
    
    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount > 10) {
      return `${field} must be 10 words or less`;
    }
    return '';
  };

  const validateLinkedInUrl = (url: string) => {
    if (url.trim() === '') return '';
    
    if (!url.includes('linkedin.com')) {
      return 'Please enter a valid LinkedIn profile URL';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      const numericValue = value.replace(/\D/g, '');
      
      setFormData({
        ...formData,
        [name]: numericValue,
      });

      if (numericValue.length > 0 && numericValue.length !== 10) {
        setErrors({ ...errors, number: 'Mobile number must be exactly 10 digits' });
      } else {
        setErrors({ ...errors, number: '' });
      }
    } else if (name === 'linkedinProfile') {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      const errorMessage = validateLinkedInUrl(value);
      setErrors({ ...errors, linkedinProfile: errorMessage });
    } else if (['jeevanKaFunda', 'iitjIs', 'crazyMoment', 'lifeTitle'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      const errorMessage = validateWordCount(value, name);
      setErrors({ ...errors, [name]: errorMessage });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

const handleNext = () => {
  if (step < totalSteps) {
    setStep(step + 1);
  } else {

    setIsLoading(true);
    if (formData.photo) {
      const reader = new FileReader();
      reader.onloadend = () => {

        const requestData = {
          photoUrl: reader.result, 
          number: formData.number,
        };

        const socialData = {
          linkedinProfile: formData.linkedinProfile
        };

        const requestDataWithText = {
          jeevanKaFunda: formData.jeevanKaFunda,
          iitjIs: formData.iitjIs,
          crazyMoment: formData.crazyMoment,
          lifeTitle: formData.lifeTitle
        };
        
        fetch("/api/social-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: JSON.stringify(socialData),
          credentials: "include",
        })
        .then(response => {
          if (!response.ok) {
            console.error("Failed to save social profile data"); 
          }
        })
        .catch(error => {
          console.error("Error saving social profile:", error);
          setIsLoading(false);
        });
        
        fetch("/api/additional-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: JSON.stringify(requestDataWithText),
          credentials: "include",
        })
        .catch(error => {
          console.error("Error saving additional info:", error);
          setIsLoading(false);
        });

        fetch("/api/users/update-preference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: JSON.stringify(requestData),
          credentials: "include",
        })
          .then(async (response) => {
            if (response.ok) {
              await response.json();
              
              await fetch("/api/users/change-preference", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                },
              });
              console.log("Preferences updated successfully");
              setIsLoading(false);
              router.push("/dashboard"); 
            } else {
              const errorData = await response.json();
              console.error("Failed to update preferences:", errorData);
            }
          })
          .catch((error) => {
            console.error("Error updating preferences:", error);
            setIsLoading(false);
          });
      };
      reader.readAsDataURL(formData.photo);
    } else {
      console.error("No photo selected");
    }
  }
};

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return !!formData.photo;
      case 2:
        return !!formData.number && errors.number === '' && 
               (formData.linkedinProfile === '' || errors.linkedinProfile === '');
      case 3:
        const allFieldsFilled = 
          !!formData.jeevanKaFunda && 
          !!formData.iitjIs && 
          !!formData.crazyMoment && 
          !!formData.lifeTitle;
        
        const noErrors = 
          errors.jeevanKaFunda === '' && 
          errors.iitjIs === '' && 
          errors.crazyMoment === '' && 
          errors.lifeTitle === '';
          
        return allFieldsFilled && noErrors;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-white shadow-lg">
        <CardContent className="pt-6">
          <div className="flex justify-between mb-6">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`h-2 ${index === totalSteps - 1 ? "w-1/5" : "w-1/5"} rounded-full ${
                  step >= index + 1 ? "bg-blue-600" : "bg-gray-200"
                } transition-colors duration-300 ${
                  index !== totalSteps - 1 ? "mr-1" : ""
                }`}
              ></div>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            {step === 1
              ? "Upload Photo"
              : step === 2
              ? "Your Contact Information"
              : step === 3
              ? "About You"
              : "Review & Submit"}
          </h2>

          {step === 1 && (
            <div className="space-y-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                {formData.photoPreview ? (
                  <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-200 shadow-lg">
                    <Image
                      src={formData.photoPreview || "/placeholder.svg"}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full bg-blue-50 flex items-center justify-center mb-4 border-4 border-blue-200 shadow-lg">
                    <Upload className="h-12 w-12 text-blue-400" />
                  </div>
                )}
                <label htmlFor="photo-upload" className="cursor-pointer mt-4">
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{formData.photo ? "Change photo" : "Upload your photo"}</span>
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-4 text-center max-w-md">
                  Upload a high-quality photo for your yearbook profile. This will be visible to other students.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="h-5 w-5 text-blue-600" />
                <Label htmlFor="number" className="text-lg font-medium">Your Contact Information</Label>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="number" className="text-sm font-medium">Mobile Number</Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    className="bg-white border-gray-300"
                    type="tel"
                    placeholder="Enter your mobile number"
                  />
                  {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                </div>
                
                <div>
                  <Label htmlFor="linkedinProfile" className="text-sm font-medium flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </Label>
                  <Input
                    id="linkedinProfile"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                    className="bg-white border-gray-300 mt-1"
                    type="url"
                    placeholder="https://www.linkedin.com/in/yourprofile"
                  />
                  {errors.linkedinProfile && <p className="text-red-500 text-sm mt-1">{errors.linkedinProfile}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Share your LinkedIn profile to connect with classmates after graduation
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Your IITJ Story</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please share brief thoughts about your journey at IIT Jodhpur. Each answer should be less than 10 words which will be further used in the yearbook.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jeevanKaFunda" className="text-sm font-medium flex justify-between">
                    <span>Jeevan Ka Funda</span>
                    <span className={`text-xs ${getWordCount(formData.jeevanKaFunda) > 10 ? 'text-red-500' : 'text-gray-500'}`}>
                      {getWordCount(formData.jeevanKaFunda)}/10 words
                    </span>
                  </Label>
                  <Textarea
                    id="jeevanKaFunda"
                    name="jeevanKaFunda"
                    value={formData.jeevanKaFunda}
                    onChange={handleInputChange}
                    className="mt-1 bg-white border-gray-300"
                    placeholder="Your life philosophy in a few words..."
                  />
                  {errors.jeevanKaFunda && <p className="text-red-500 text-xs mt-1">{errors.jeevanKaFunda}</p>}
                </div>
                
                <div>
                  <Label htmlFor="iitjIs" className="text-sm font-medium flex justify-between">
                    <span>For me IITJ is</span>
                    <span className={`text-xs ${getWordCount(formData.iitjIs) > 10 ? 'text-red-500' : 'text-gray-500'}`}>
                      {getWordCount(formData.iitjIs)}/10 words
                    </span>
                  </Label>
                  <Textarea
                    id="iitjIs"
                    name="iitjIs"
                    value={formData.iitjIs}
                    onChange={handleInputChange}
                    className="mt-1 bg-white border-gray-300"
                    placeholder="What IITJ means to you..."
                  />
                  {errors.iitjIs && <p className="text-red-500 text-xs mt-1">{errors.iitjIs}</p>}
                </div>
                
                <div>
                  <Label htmlFor="crazyMoment" className="text-sm font-medium flex justify-between">
                    <span>Life ka Crazy moment</span>
                    <span className={`text-xs ${getWordCount(formData.crazyMoment) > 10 ? 'text-red-500' : 'text-gray-500'}`}>
                      {getWordCount(formData.crazyMoment)}/10 words
                    </span>
                  </Label>
                  <Textarea
                    id="crazyMoment"
                    name="crazyMoment"
                    value={formData.crazyMoment}
                    onChange={handleInputChange}
                    className="mt-1 bg-white border-gray-300"
                    placeholder="A memorable crazy moment..."
                  />
                  {errors.crazyMoment && <p className="text-red-500 text-xs mt-1">{errors.crazyMoment}</p>}
                </div>
                
                <div>
                  <Label htmlFor="lifeTitle" className="text-sm font-medium flex justify-between">
                    <span>Title for my life at IITJ</span>
                    <span className={`text-xs ${getWordCount(formData.lifeTitle) > 10 ? 'text-red-500' : 'text-gray-500'}`}>
                      {getWordCount(formData.lifeTitle)}/10 words
                    </span>
                  </Label>
                  <Textarea
                    id="lifeTitle"
                    name="lifeTitle"
                    value={formData.lifeTitle}
                    onChange={handleInputChange}
                    className="mt-1 bg-white border-gray-300"
                    placeholder="If your IITJ life was a book title..."
                  />
                  {errors.lifeTitle && <p className="text-red-500 text-xs mt-1">{errors.lifeTitle}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Review Your Information</h3>
                <p className="text-sm text-gray-700">
                  Please review the information you&apos;ve provided. Once submitted, this information will be 
                  used in your yearbook profile. It can be updated later if needed.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="w-full md:w-1/4">
                    <h4 className="font-medium text-gray-700">Photo</h4>
                    {formData.photoPreview ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mt-1">
                        <Image
                          src={formData.photoPreview}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : <p className="text-sm text-red-500">No photo uploaded</p>}
                  </div>
                  
                  <div className="w-full md:w-3/4">
                    <h4 className="font-medium text-gray-700">Contact Information</h4>
                    <p className="text-sm text-gray-600 mt-1">Mobile: {formData.number || "Not provided"}</p>
                    <p className="text-sm text-gray-600 mt-1">LinkedIn: {formData.linkedinProfile || "Not provided"}</p>
                    
                    <h4 className="font-medium text-gray-700 mt-4">Jeevan Ka Funda</h4>
                    <p className="text-sm text-gray-600 mt-1 break-words">{formData.jeevanKaFunda || "Not provided"}</p>
                    
                    <h4 className="font-medium text-gray-700 mt-4">For me IITJ is</h4>
                    <p className="text-sm text-gray-600 mt-1 break-words">{formData.iitjIs || "Not provided"}</p>
                    
                    <h4 className="font-medium text-gray-700 mt-4">Life ka Crazy moment</h4>
                    <p className="text-sm text-gray-600 mt-1 break-words">{formData.crazyMoment || "Not provided"}</p>
                    
                    <h4 className="font-medium text-gray-700 mt-4">Title for my life at IITJ</h4>
                    <p className="text-sm text-gray-600 mt-1 break-words">{formData.lifeTitle || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

                    <div className="flex justify-between mt-6">
                      {step > 1 ? (
                        <Button
                          type="button"
                          onClick={handleBack}
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepComplete() || isLoading}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {step === totalSteps ? "Uploading..." : "Next"}
                        </>
                      ) : (
                        <>
                          {step === totalSteps ? "Submit" : "Next"} {step < totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
                        </>
                      )}
                    </Button>

                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          }
